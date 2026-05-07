import json
import boto3
import logging
import os

# ============================================
# AWS Bedrock 設定
# ============================================
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-west-2"
)

# 使用 Amazon Nova Pro 以獲得最穩定的 JSON 輸出
MODEL_ID = "amazon.nova-pro-v1:0"

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def load_course_data():
    """載入課程數據 (Person 3 提供的 JSON)"""
    try:
        current_dir = os.path.dirname(__file__)
        file_path = os.path.join(current_dir, "data", "sample_courses.json")
        
        if not os.path.exists(file_path):
            logger.warning(f"找不到檔案: {file_path}")
            return []
            
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as e:
        logger.error(f"載入數據失敗: {str(e)}")
        return []

def build_prompt(student_profile, course_data):
    """
    根據 Hackathon 文件建構 Prompt。
    確保欄位名稱如 workloadba, career_path, Recommendations 完全對齊規格。
    """
    return f"""
You are an expert AI Academic Advisor for UBC students. Your goal is to provide personalized course matching.

==================================================
STUDENT PROFILE (INPUT)
==================================================
{json.dumps(student_profile, indent=2)}

==================================================
AVAILABLE COURSES DATA
==================================================
{json.dumps(course_data, indent=2)}

==================================================
TASK
==================================================
Recommend exactly {student_profile.get('num_courses', 3)} courses.

Your response MUST be a single JSON object. DO NOT include markdown tags.
Strictly follow this Response Schema:
{{
  "success": true,
  "profile_summary": "2-sentence summary of the student.",
  "Recommendations": [
    {{
      "course": "e.g. CPSC 340",
      "title": "Course Title",
      "reason": "Why this matches student interests",
      "workload": "light, balanced, or heavy",
      "skills_gained": ["skill1", "skill2"],
      "warning": "e.g. Math intensive",
      "overall_match": "iteger 0-100",
      "professors": [
        {{
          "name": "Dr. Name",
          "professor_style": "Style description",
          "student_experience": "Feedback summary",
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

def extract_json(text):
    """從 AI 回傳文本中提取 JSON"""
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except Exception as e:
        logger.error(f"JSON 提取失敗: {str(e)}")
        raise

def lambda_handler(event, context):
    try:
        logger.info(f"收到事件: {json.dumps(event)}")
        
        # 解析 Request Body (對齊文件中的 Request Body 範例)
        body = json.loads(event.get("body", "{}"))
        
        # 建立 Profile (確保對齊文件中的欄位名稱，如 workloadba)
        student_profile = {
            "major": body.get("major", "Computer Science"),
            "transcript": body.get("transcript", []),
            "courses_enjoyed": body.get("courses_enjoyed", []),
            "courses_disliked": body.get("courses_disliked", []),
            "professors_liked": body.get("professors_liked", []),
            "learning_style": body.get("learning_style", []),
            "work_style": body.get("work_style", ""),
            "assessment_preference": body.get("assessment_preference", []),
            "lecture_style": body.get("lecture_style", ""),
            "career_path": body.get("career_path", ""), # 文件規格使用 career_path
            "technical_interests": body.get("technical_interests", []),
            "breadth_or_depth": body.get("breadth_or_depth", ""),
            "graduating_soon": body.get("graduating_soon", False),
            "num_courses": body.get("num_courses", 3),
            "working_part_time": body.get("working_part_time", False),
            "time_preference": body.get("time_preference", ""),
            "mbti": body.get("mbti", ""),
            "workloadba": body.get("workloadba", body.get("workload_tolerance", "balanced")), # 文件規格使用 workloadba
            "term_goal": body.get("term_goal", ""),
            "open_chat": body.get("open_chat", "")
        }

        course_data = load_course_data()
        prompt = build_prompt(student_profile, course_data)

        # 呼叫 Amazon Bedrock
        response = bedrock.converse(
            modelId=MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 2500, "temperature": 0.2}
        )

        output_text = response["output"]["message"]["content"][0]["text"]
        result = extract_json(output_text)

        # 回傳 API Gateway (確保 Recommendations 首字母大寫，完全符合文件)
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
        logger.error(f"錯誤: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": False, "error": "Internal Server Error"})
        }