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

# Amazon Nova Pro Model
MODEL_ID = "amazon.nova-pro-v1:0"

# ============================================
# Logging Configuration
# ============================================

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ============================================
# Load Course Dataset
# ============================================

def load_course_data():
    """
    Loads course dataset from sample_courses.json
    """

    current_dir = os.path.dirname(__file__)

    file_path = os.path.join(
        current_dir,
        "..",
        "data",
        "sample_courses.json"
    )

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

# ============================================
# Build Prompt
# ============================================

def build_prompt(student_profile, course_data):

    transcript = student_profile.get("transcript", [])
    interests = student_profile.get("interests", [])
    learning_style = student_profile.get("learning_style", "")
    workload_preference = student_profile.get("workload_preference", "")
    career_goals = student_profile.get("career_goals", "")

    return f"""
You are an AI academic advisor for upper-year university students.

Your task is to recommend the BEST matching courses and professors
based ONLY on the provided course dataset.

Carefully consider:
- student's completed courses
- interests
- learning style
- workload preference
- career goals

==================================================
STUDENT PROFILE
==================================================

Transcript:
{json.dumps(transcript, indent=2)}

Interests:
{json.dumps(interests, indent=2)}

Learning Style:
{learning_style}

Workload Preference:
{workload_preference}

Career Goals:
{career_goals}

==================================================
AVAILABLE COURSES
==================================================

{json.dumps(course_data, indent=2)}

==================================================
TASK
==================================================

Recommend 3 to 5 courses that best fit the student.

For each recommendation include:
- course code
- course title
- recommended professor
- reason for recommendation
- expected workload
- skills gained

Respond ONLY in valid JSON format.

Example:

[
  {{
    "course": "CPSC 310",
    "title": "Software Engineering",
    "professor": "Dr. Smith",
    "reason": "Strong fit for software engineering interests and hands-on learning style.",
    "workload": "High",
    "skills_gained": [
      "Software engineering",
      "Team collaboration",
      "Full-stack development"
    ]
  }}
]

IMPORTANT:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations
- Do NOT include extra text
"""

# ============================================
# Generate Recommendations Using Nova Pro
# ============================================

def generate_recommendations(prompt):

    logger.info("Calling Amazon Nova Pro...")

    response = bedrock.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        inferenceConfig={
            "maxTokens": 1200,
            "temperature": 0.3
        }
    )

    output_text = response["output"]["message"]["content"][0]["text"]

    logger.info(f"Raw model output: {output_text}")

    return extract_json(output_text)

# ============================================
# Extract JSON Safely
# ============================================

def extract_json(text):

    try:

        json_start = text.find("[")
        json_end = text.rfind("]") + 1

        if json_start == -1 or json_end == 0:
            raise ValueError("No JSON array found")

        json_string = text[json_start:json_end]

        return json.loads(json_string)

    except Exception as e:

        logger.error(f"JSON extraction failed: {str(e)}")

        raise ValueError("Invalid JSON response from Nova Pro")

# ============================================
# Lambda Handler
# ============================================

def lambda_handler(event, context):

    try:

        logger.info(f"Received event: {json.dumps(event)}")

        # ------------------------------------
        # Parse Request Body
        # ------------------------------------

        body = json.loads(event["body"])

        student_profile = {
            "transcript": body.get("transcript", []),
            "interests": body.get("interests", []),
            "learning_style": body.get("learning_style", ""),
            "workload_preference": body.get("workload_preference", ""),
            "career_goals": body.get("career_goals", "")
        }

        logger.info(f"Student profile: {student_profile}")

        # ------------------------------------
        # Load Course Dataset
        # ------------------------------------

        course_data = load_course_data()

        logger.info(f"Loaded {len(course_data)} courses")

        # ------------------------------------
        # Build Prompt
        # ------------------------------------

        prompt = build_prompt(student_profile, course_data)

        # ------------------------------------
        # Generate AI Recommendations
        # ------------------------------------

        recommendations = generate_recommendations(prompt)

        # ------------------------------------
        # Return Response
        # ------------------------------------

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "success": True,
                "recommendations": recommendations
            })
        }

    except Exception as e:

        logger.error(f"Lambda error: {str(e)}")

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "success": False,
                "error": str(e)
            })
        }

# ============================================
# Local Testing
# ============================================

if __name__ == "__main__":

    test_event = {
        "body": json.dumps({
            "transcript": [
                "CPSC 110",
                "CPSC 121"
            ],
            "interests": [
                "AI",
                "software engineering"
            ],
            "learning_style": "hands-on",
            "workload_preference": "medium",
            "career_goals": "machine learning engineer"
        })
    }

    result = lambda_handler(test_event, None)

    print(json.dumps(result, indent=2))