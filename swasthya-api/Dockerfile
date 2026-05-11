# Use AWS Lambda base image
FROM public.ecr.aws/lambda/python:3.11

# Install system dependency (for LightGBM)
RUN yum install -y libgomp

# Upgrade pip
RUN pip install --upgrade pip

# Install Python libraries (prebuilt only)
RUN pip install --only-binary=:all: \
    numpy==1.26.4 \
    pandas==2.2.2 \
    scipy==1.11.4 \
    scikit-learn==1.4.2 \
    joblib==1.3.2 \
    lightgbm==3.3.5

# Copy your Lambda function
COPY lambda_function.py .

# Copy models folder
COPY models/ ./models/

# Set Lambda handler
CMD ["lambda_function.lambda_handler"]