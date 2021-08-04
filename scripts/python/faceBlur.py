# Importing libraries
import sys
import cv2 as cv
#import matplotlib.pyplot as plt

print("\n[Python] Starting face blur cv2 version: " + cv.__version__)

image_path = sys.argv[1]
model_path = sys.argv[2]

# A function for plotting the images
#def plotImages(img):
#    plt.imshow(img, cmap="gray")
#    plt.axis('off')
#    plt.style.use('seaborn')
#    plt.show()
  
#load image
image = cv.imread(image_path)

#convert image to grayscale image
gray_image = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

#read the harr_face_detect_classifier.xml
harr_cascade = cv.CascadeClassifier(model_path)

face_cords = harr_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=1 )

for x, y, w, h in face_cords:
    blur_face = image[y:y+h, x:x+w]
    blur_face = cv.GaussianBlur(blur_face,(23, 23), 30)
    image[y:y+blur_face.shape[0], x:x+blur_face.shape[1]] = blur_face

cv.imwrite(image_path, image)

print("[Python] Image blur end!", end="")

# Reading an image using OpenCV
# OpenCV reads images by default in BGR format
#image = cv2.imread(image_path)
  
# Converting BGR image into a RGB image
#image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
  
# plotting the original image
#plotImages(image)
  
#face_detect = cv2.CascadeClassifier('haarcascade_frontalface_alt.xml')
#face_data = face_detect.detectMultiScale(image, 1.3, 5)
  
# Draw rectangle around the faces which is our region of interest (ROI)
#for (x, y, w, h) in face_data:
#    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
#    roi = image[y:y+h, x:x+w]
#    # applying a gaussian blur over this new rectangle area
#    roi = cv2.GaussianBlur(roi, (23, 23), 30)
#    # impose this blurred image on original image to get final image
#    image[y:y+roi.shape[0], x:x+roi.shape[1]] = roi

# Display the output
#plotImages(image)