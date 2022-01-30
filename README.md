# Project Title

Calorie Guide

## Motivation

코로나 펜데믹 현상으로 인해 체중이 증가한 사람이 증가함으로 인해 현대인의 식단관리를
스스로 수월하게 관리할 수 있는 어플을 만들면 어떨까 하는 생각으로 주제 선정

## 기존의 존재하는 식단 관리 어플들과의 차별화

![한계점](https://user-images.githubusercontent.com/73628812/151692783-df5dedc4-0072-471b-8ab4-cfee6b838ec3.PNG)
<br>-> 이러한 기존 어플의 문제점들을 해결

## 프로젝트 목적

+ 하루 섭취 성분 시각화와 간편한 식단 추가 기능을 통한 식단관리의 어려움 해소
+ 운동 초심자부터 상급자까지 다양한 사람들이 목적에 맞는 식단관리를 할 수 있도록 함

## 사용 기술

![tools](https://user-images.githubusercontent.com/73628812/151692739-a257082d-0d23-45d5-82f0-22e6f3cae542.PNG)

## Languages

+ Javascript
+ HTML/CSS
+ tensorflow.js
+ node.js
+ JSON
+ Pug

## 시스템 흐름

![시스템 흐름](https://user-images.githubusercontent.com/73628812/151692941-afe5b337-488e-4659-b907-f363bf22fd08.PNG)

## Functions

+ 사용자가 음식 사진을 찍으면 머신러닝으로 학습된 데이터에 기반해 음식의 종류를 식별해 사용자에게 제공
+ 사용자는 자신의 목표(체중 감소, 체중 증가, 체중 유지)와 본인의 키, 몸무게에 따라 일일 목표 섭취량이 계산됨
+ 먹은 음식을 아침,점심,저녁,간식 카테고리별로 추가할 때마다 일일 목표 섭취량에 자동으로 추가됨
+ 사용자들끼리 커뮤니티를 통해 식단이나 일상을 공유하면서 즐겁게 식단 관리를 할 수 있도록 함

## My role

+ tensorflow.js를 이용해 머신러닝을 통한 학습모델 구현
+ 머신러닝 학습에 필요한 음식 사진들을 데이터 크롤링해서 가져와 Teachable Machine을 통해 학습
+ node.js, Javascript, JSON 을 이용해 Back-end 구현
