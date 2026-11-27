---
title: '[GCP] Getting Started with Cloud PubSub'
description: '[GCP] Getting Started with Cloud PubSub'
date: '2022-03-09'
tags:
  - GCP
  - Python
slug: gcp-getting-started-with-cloud-pubsub
author: Cenz Wong
---
# Python

## Installation
```bash
pip install --upgrade google-cloud-pubsub
```

## Python Snippets
```bash
git clone https://github.com/googleapis/python-pubsub.git
cd python-pubsub/samples/snippets
```
[Github_Link](https://github.com/googleapis/python-pubsub/tree/main/samples/snippets)

**Topic** is a shared string that allows applications to connect with one another through a common thread.

**Publishers **push (or publish) a message to a Cloud Pub/Sub topic. 

**Subscribers **will then make a subscription to that thread, where they will either pull messages from the topic or configure webhooks for push subscriptions. 

Every subscriber must acknowledge each message within a configurable window of time.

## Usage
use Python to create the topic, subscriber, and then view the message


```bash
# Create topics
gcloud pubsub topics create myTopic
python publisher.py $GOOGLE_CLOUD_PROJECT create MyTopic

# List topics in project
gcloud pubsub topics list
python publisher.py $GOOGLE_CLOUD_PROJECT list

# Delete topics
gcloud pubsub topics delete myTopic

# Create topics Subscription
gcloud  pubsub subscriptions create --topic myTopic mySubscription
python subscriber.py $GOOGLE_CLOUD_PROJECT create MyTopic MySub

# List Subscriptions in topics
gcloud pubsub topics list-subscriptions myTopic
python subscriber.py $GOOGLE_CLOUD_PROJECT list-in-project

# Publish a message on a topic
gcloud pubsub topics publish myTopic --message "Hello"

# Subscribe a message to a topic
gcloud pubsub topics subscribe MyTopic
python subscriber.py $GOOGLE_CLOUD_PROJECT receive MySub

# Pull messages (default is 1)
gcloud pubsub subscriptions pull mySubscription --auto-ack
gcloud pubsub subscriptions pull mySubscription --auto-ack --limit=3
```
> the Publisher.py file is in python-pubsub/samples/snippets/publisher.py

> python publisher.py $GOOGLE_CLOUD_PROJECT list
> "projects/qwiklabs-gcp-01-9e3fa6b48a07/topics/MyTopic"


- Sending Message via Console
![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1646790883228/w9klN2NIx.png)
