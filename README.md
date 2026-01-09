# ai-idea-evaluator

로컬 개발 시작 가이드

## 요구사항
- Python 3.10+
- (선택) Docker

## 실행 (로컬)
```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API 문서: http://localhost:8000/docs
