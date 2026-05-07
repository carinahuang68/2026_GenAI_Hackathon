import json
import boto3
import logging
import os

# ============================================
# AWS Bedrock Configuration
# ============================================
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-west-2"
)

# Amazon Nova Pro for high-quality structured JSON
MODEL_ID = "us.anthropic.claude-sonnet-4-6"

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ============================================
# Load Course Dataset
# ============================================
def load_course_data():
    """
    Loads course dataset from the local 'data' directory.
    This fulfills the requirement of using curated metadata for the demo.
    """
    try:
        current_dir = os.path.dirname(__file__)
        file_path = os.path.join(current_dir, "data", "sample_courses.json")
        
        if not os.path.exists(file_path):
            logger.warning(f"Data file not found at {file_path}. Proceeding with empty list.")
            return []
            
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as e:
        logger.error(f"Failed to load course data: {str(e)}")
        return []

# ============================================
# Build Prompt (Strictly English & Schema Alignment)
# ============================================
def build_prompt(student_profile, course_data):
    """
    Constructs the AI advisor prompt. 
    Forces the model to adhere to the schema provided in the Hackathon document.
    """
    return f"""
You are an expert AI Academic Advisor for UBC. Your task is to analyze the student's profile and recommend courses from the provided dataset.

==================================================
STUDENT PROFILE (JSON)
==================================================
{json.dumps(student_profile, indent=2)}

==================================================
AVAILABLE COURSES DATA
==================================================
{json.dumps(course_data, indent=2)}

==================================================
REQUIRED OUTPUT FORMAT (JSON ONLY)
==================================================
You must respond with a single, valid JSON object. 
DO NOT include markdown tags, intro text, or conversational filler.
Everything must be in English.

JSON STRUCTURE:
{{
  "profile_summary": "A 2-sentence summary of the student's academic persona.",
  "Recommendations": [
    {{
      "course": "Course Code (e.g., CPSC 340)",
      "title": "Full Course Title",
      "reason": "Explain why this matches their interests/goals.",
      "workload": "heavy, balanced, or light",
      "skills_gained": ["Skill 1", "Skill 2"],
      "warning": "Challenge indicators (e.g., 'Math intensive')",
      "professors": [
        {{
          "name": "Professor Name",
          "professor_style": "Description of teaching style.",
          "student_experience": "Summary of student feedback.",
          "match_scores": {{
            "learning_style": 0-100,
            "goals": 0-100,
            "grades": 0-100,
            "personality": 0-100,
            "professor_quality": 0-100
          }}
        }}
      ]
    }}
  ]
}}
"""

# ============================================
# Extract JSON Safely
# ============================================
def extract_json(text):
    """Parses JSON from the model response, ignoring any non-JSON text."""
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON object found")
        return json.loads(text[start:end])
    except Exception as e:
        logger.error(f"JSON extraction failed: {str(e)} | Raw Output: {text}")
        raise

# ============================================
# Lambda Handler
# ============================================
def lambda_handler(event, context):
    try:
        logger.info("Processing recommendation request")
        
        # 1. Parse Input Body (Mapping to Hackathon Doc Schema)
        body = json.loads(event.get("body", "{}"))
        
        student_profile = {
            "major": body.get("major"),
            "transcript": body.get("transcript", []),
            "courses_enjoyed": body.get("courses_enjoyed", []),
            "courses_disliked": body.get("courses_disliked", []),
            "professors_liked": body.get("professors_liked", []),
            "learning_style": body.get("learning_style", []),
            "work_style": body.get("work_style", ""),
            "assessment_preference": body.get("assessment_preference", []),
            "lecture_style": body.get("lecture_style", ""),
            "career_path": body.get("career_path", ""),
            "technical_interests": body.get("technical_interests", []),
            "breadth_or_depth": body.get("breadth_or_depth", ""),
            "graduating_soon": body.get("graduating_soon", False),
            "num_courses": body.get("num_courses", 3),
            "working_part_time": body.get("working_part_time", False),
            "time_preference": body.get("time_preference", ""),
            "mbti": body.get("mbti", ""),
            "workloadba": body.get("workloadba", "balanced"),
            "term_goal": body.get("term_goal", ""),
            "open_chat": body.get("open_chat", "")
        }

        # 2. Load Metadata
        course_data = load_course_data()
        
        # 3. Call AI
        prompt = build_prompt(student_profile, course_data)
        
        response = bedrock.converse(
            modelId=MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 2500, "temperature": 0.2}
        )
        
        output_text = response["output"]["message"]["content"][0]["text"]
        result = extract_json(output_text)
        
        # 4. Final Response (Aligned with success: true schema)
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "success": True,
                "profile_summary": result.get("profile_summary", ""),
                "Recommendations": result.get("Recommendations", result.get("recommendations", []))
            })
        }

    except Exception as e:
        logger.error(f"Execution failed: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "success": False,
                "error": "Internal Server Error"
            })
        }