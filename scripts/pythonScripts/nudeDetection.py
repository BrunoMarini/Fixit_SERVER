from nudity import Nudity
import nudity

import tensorflow.compat.v1 as tf
import os

tf.compat.v1.disable_eager_execution()
tf.disable_v2_behavior() 

import sys
import argparse

nudity = Nudity()

message_type = str

parser = argparse.ArgumentParser(description='Retrieve required segment.')
parser.add_argument('message', type=message_type, nargs=1, help='Message')

print('Args: ' + str(sys.argv))

img_path = '00E8007F-5BC4-48CE-95C8-B893567EB76D.jpg'
isNude = nudity.has(img_path)
score = nudity.score(img_path)


print("Result:iNude:{}@score:{}".format(isNude, score), end="")