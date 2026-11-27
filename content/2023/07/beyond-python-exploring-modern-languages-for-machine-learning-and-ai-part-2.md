---
title: 'Beyond Python: Exploring Modern Languages for Machine Learning and AI (Part 2)'
description: Top Programming Languages for AI/ML in 2023
date: '2023-07-10'
tags:
  - java
  - javascript
  - Python
  - machine-learning
  - typescript
slug: beyond-python-exploring-modern-languages-for-machine-learning-and-ai-part-2
author: Cenz Wong
cover: >-
  https://cdn.hashnode.com/res/hashnode/image/upload/v1688955620276/01633dd2-f911-47cf-9884-e65931d64e3f.png
---
In the first part of "[Beyond Python: Exploring Modern Languages for Machine Learning and AI](https://hashnode.com/post/clh9fg123000109mg30ly2zsk)", we initiated a discussion on the potential of alternative programming languages for machine learning and AI tasks, using Mojo as our starting point. This article will extend that conversation, delving deeper into the subject matter. Welcome to Beyond Python Part 2.

# Web-centric Programming Languages

## JavaScript / TypeScript

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

JavaScript is a popular programming language that can be used for various purposes, including data science. JavaScript is used in data science for the development and design of websites, databases, and applications, the creation of data visualizations and diagrams, as well as more recent methods of creating machine learning models. JavaScript is also known for the creation of unique and engaging visual experiences, making it a useful programming language for data scientists that are invested in creating complex data visualizations and project portfolios.

JavaScript has many unique properties that make it suitable for data science. A non-blocking, I/O structure ensures efficient memory and CPU allocation for high-throughput processing tasks. JavaScript is also the language of the web, which means it runs everywhere and enables interactive and collaborative analyses. JavaScript has a rich and growing open-source ecosystem, with libraries and tools for every level of the data science stack. Some examples are:

* [**D3.js**](https://d3js.org/): A library for creating dynamic and interactive data visualizations using web standards.
    
* [**TensorFlow.js**](https://www.tensorflow.org/js): A library for developing and training machine learning models in JavaScript, and deploying them in browsers or on Node.js.
    
* [**Plotly.js**](https://plotly.com/javascript/): A high-level declarative charting library built on top of D3.js that supports over 40 chart types.
    

Other famous libraries would be

* Math: [math.js](https://mathjs.org/)
    
* Data Aggregation: [Tidy.js](https://pbeshai.github.io/tidy/), [Apache Arrow](https://arrow.apache.org/), [Koopjs](https://koopjs.github.io/), [Empujar](https://github.com/taskrabbit/empujar), [Papa Parse](https://www.papaparse.com/)
    
* Machine Learning: [ML5.js](https://ml5js.org/), [nlp.js](https://github.com/axa-group/nlp.js/), [Synaptic](https://caza.la/synaptic/#/), [ConvNetJS](https://cs.stanford.edu/people/karpathy/convnetjs/)
    
* Charting: [Observable Plot](https://observablehq.com/plot/), [Chart.js](https://www.chartjs.org/), [Sigma.js](https://www.sigmajs.org/), [Apache ECharts](https://echarts.apache.org/), [Cytoscape.js](https://js.cytoscape.org/), [Three.js](https://threejs.org/), [Recharts](https://recharts.org/), [p5.js](https://p5js.org/), [Google Charts](https://developers.google.com/chart)
    
* Query: [Knex.js (](https://knexjs.org/)[knexjs.org](http://knexjs.org)[)](https://knexjs.org/), [AlaSQL](https://github.com/AlaSQL/alasql), [Sequelize](https://sequelize.org/), [Objection.js](https://vincit.github.io/objection.js/), [Bookshelf.js](https://bookshelfjs.org/), [sql.js](https://github.com/sql-js/sql.js/)
    
* Model Inferencing: [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
    
* Accelerating Library: [WebGPU](https://gpuweb.github.io/gpuweb/), [WebAssembly](https://rob-blackbourn.github.io/blog/datascience/data/science/webassembly/wasm/array/arrays/javascript/c/dataframe/2020/06/13/datascience-javascript.html), [napajs](https://github.com/Microsoft/napajs#napajs), [Deno](https://deno.land/), [Node.js](https://nodejs.org/en), [Parallel.js](https://parallel.js.org/),
    

A special shoutout on a Jupyter Notebook-alike product for Javascript would be the [Observable](https://observablehq.com/) which has a reactive runtime that is well suited for interactive data exploration and analysis.

Of course, JavaScript also has some limitations and challenges for data science. For example, it lacks native support for multidimensional arrays and operator overloading, which can make some mathematical operations more verbose or cumbersome. It also has a dynamic typing system, which can introduce errors or bugs that are hard to catch at runtime. Moreover, JavaScript may not be as performant or scalable as some other languages for certain tasks, such as parallel processing or big data analysis.

Therefore, whether JavaScript is good for data science depends on your goals, preferences, and use cases. JavaScript can be a powerful and versatile tool for creating web-based applications, visualizations, and models that can reach a wide audience and offer interactivity and collaboration. However, it may not be the best choice for every data science problem or project, especially if you need high performance, scalability, or strict type checking.

TypeScript is a superset of JavaScript that adds static typing and other features to the language. It is often used for developing large-scale web applications, as it helps catch errors early in the development process and makes it easier to maintain large codebases. TypeScript also offers better performance than Python for certain types of web applications.

> Fun fact
> 
> [https://www.codecademy.com/resources/blog/java-vs-javascript/?ssp=1&darkschemeovr=1&setlang=en-XL&safesearch=moderate](https://www.codecademy.com/resources/blog/java-vs-javascript/?ssp=1&darkschemeovr=1&setlang=en-XL&safesearch=moderate)

> Also check out the introduction video from Fireship: [D3.js in 100 Seconds - YouTube](https://www.youtube.com/watch?v=bp2GF8XcJdY)
> 
> Books: [software-tools-books/js4ds: JavaScript for Data Science (](https://github.com/software-tools-books/js4ds)[github.com](http://github.com)[)](https://github.com/software-tools-books/js4ds)
> 
> [Java Script for Data Science: Libraries, Tools & Use Cases (](https://www.knowledgehut.com/blog/data-science/javascript-data-science)[knowledgehut.com](http://knowledgehut.com)[)](https://www.knowledgehut.com/blog/data-science/javascript-data-science)

---

# JVM-Based Languages

Java and Scala are both programming languages that run on the **Java Virtual Machine (JVM)**, which means they can interoperate and share libraries. However, they have different syntax, features, and paradigms. Some of the main differences like Java does not support **operator overloading**, **lazy evaluation**, or **pattern matching**, while Scala does.

## Java

![](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

Java is a widely-used language for enterprise applications, but it also has several machine learning libraries available for data science tasks. Weka, Deeplearning4j, and H2O are some of the popular libraries that support data science with Java. However, using Java for data science has its pros and cons. Java's object-oriented and functional nature can aid with data abstraction and code reuse, and its large developer community and multiple APIs such as Weka, ND4J, and Deeplearning4j can support data science tasks. Additionally, Java is fast, scalable, and portable, making it suitable for handling large and complex data sets. However, it can be verbose and boilerplate-heavy, resulting in less readable code that is more prone to errors. Java also has a steep learning curve and requires more knowledge of data structures and algorithms than other languages like Python or R. Furthermore, Java has limited support for some data science functions such as data visualization, statistical analysis, and machine learning compared to other languages with specialized libraries and frameworks.

> [Java for Data Science – When & How To Use (](https://www.knowledgehut.com/blog/data-science/java-for-data-science)[knowledgehut.com](http://knowledgehut.com)[)](https://www.knowledgehut.com/blog/data-science/java-for-data-science)

## Scala

![](https://img.shields.io/badge/Scala-DC322F?style=for-the-badge&logo=scala&logoColor=white)

Scala is a versatile programming language that runs on the Java Virtual Machine (JVM) and is designed for building scalable, distributed systems. It is widely used for developing big data applications and web services, and it offers better performance than Python for certain types of distributed computing tasks, such as processing large amounts of data in parallel.

In addition to its suitability for big data applications, Scala has several machine learning libraries available, including Spark MLlib, which make it a viable option for data science tasks. However, using Scala for data science comes with its own set of pros and cons.

One of the main advantages of Scala for data science is its scalability and speed, which can help handle large and complex data sets, particularly in conjunction with Apache Spark. It is also multi-paradigm, allowing programmers to use both object-oriented and functional programming styles, and has a concise and expressive syntax that can make code more readable and less verbose than Java. Additionally, Scala has a strong and static type system that can catch errors at compile time and ensure type safety.

On the other hand, Scala has a steep learning curve and requires more knowledge of advanced concepts, such as monads, implicits, and pattern matching, which can be challenging for beginners. It also has limited support for some data science functions, such as data visualization, statistical analysis, and machine learning, compared to other languages that have more specialized libraries and frameworks. Finally, Scala has a relatively low popularity and a small community, which can make it harder to find resources, tutorials, and help.

Some of the use cases for Scala include batch data processing, concurrency and distributed data processing, data analytics in conjunction with Apache Spark, parallel processing, real-time data streaming with the Spark framework, as well as web applications and web pages. With its focus on scalability and distributed computing, Scala is an excellent choice for building complex and robust systems that can handle large and diverse data sets.

## Kotlin

![Kotlin](https://img.shields.io/badge/kotlin-%237F52FF.svg?style=for-the-badge&logo=kotlin&logoColor=white)

Kotlin is a programming language that was developed by JetBrains in 2010 as an alternative to Java for their products. Kotlin is designed to be concise, safe, pragmatic, and 100% interoperable with Java. Kotlin can run on various platforms, such as Android, JVM, JavaScript, and native code via LLVM. Kotlin is very popular in Android app development, especially after Google announced it as an official language for Android in 2017. According to Google, 70% of the top 1,000 apps on the Play Store are written in Kotlin as of 2020.

With its versatility, Kotlin has become popular in various domains, including data science and machine learning, as it can be used to build data pipelines and productionize machine learning models. The language's conciseness and readability are notable strengths that make it easy to learn and write code quickly. Additionally, Kotlin's static typing and null safety features help create reliable, maintainable code that is easy to troubleshoot, minimizing the risk of errors in data pipelines and machine learning models. As a JVM language, Kotlin also offers strong performance and access to a wide range of Java libraries, simplifying the process of building data pipelines and integrating machine learning models. For data scientists and machine learning engineers, Kotlin's combination of ease of use, reliability, and performance make it a promising language for working with data.

Kotlin can be used in various data science tools and frameworks, such as Jupyter notebooks, Apache Zeppelin, Apache Spark, TensorFlow, and PyTorch. Kotlin also has a growing ecosystem of libraries for data-related tasks, such as Multik for multidimensional arrays, KotlinDL for deep learning, and Kotlin DataFrame for structured data processing. Kotlin aims to provide a fast and enjoyable developer experience for data scientists and engineers who want to work with data in a reliable and efficient way. In July 2023, Kotlin launch [Kotlin Notebook](https://blog.jetbrains.com/kotlin/2023/07/introducing-kotlin-notebook/), which further provide useful access for Data Scientist to get started on Data from Kotlin easily.

> [Kotlin for data science | Kotlin Documentation (](https://kotlinlang.org/docs/data-science-overview.html)[kotlinlang.org](http://kotlinlang.org)[)](https://kotlinlang.org/docs/data-science-overview.html)

---

# Parallel Programming Language

## Chapel

[Chapel](https://chapel-lang.org/) is a parallel programming language developed by Cray, later acquired by Hewlett Packard Enterprise, as part of the DARPA's High Productivity Computing Systems (HPCS) program. Chapel aims to increase supercomputer productivity by being scalable, portable, and expressive, supporting various parallel programming models and abstractions.

One of the advantages of Chapel is its ability to run on different platforms, from multicore laptops to cloud clusters to supercomputers. Its global-view programming model enables programmers to reason about data and tasks at a high level. Chapel also has a rich set of features and libraries for parallel and distributed computing, such as distributed arrays, domains, iterators, co-for-alls, co-begin and on-clauses. Additionally, it has a familiar syntax influenced by C, Java, Python, and other languages.

On the other hand, Chapel is not widely adopted or supported by the industry, being an emerging language. It has some performance overheads and limitations compared to lower-level languages like C or Fortran. Chapel also has some compatibility issues with existing tools and frameworks designed for other languages.

While Chapel can be used for data science, it may not be as mature or convenient as other languages like Python or R, which have more established data science ecosystems. Chapel may be more suitable for data science applications that require high performance and scalability on large-scale systems.

In summary, Chapel is a promising language that supports parallel and distributed computing, but its adoption is still limited, and it may not be as mature or convenient for data science as other more established languages.

---

Web-centric languages like JavaScript and TypeScript offer rich ecosystems and are particularly suited for creating interactive web-based applications and visualizations. JVM-based languages such as Java, Scala, and Kotlin provide robust performance and scalability, making them ideal for handling large and complex data sets, particularly in distributed computing environments. Parallel programming language like Chapel, while not as widely adopted, offers promising capabilities for high-performance computing on large-scale systems.

Ultimately, the choice of language depends on your specific goals, preferences, and use cases. It's important to consider factors such as the language's performance, scalability, ease of use, community support, and compatibility with existing tools and frameworks. By exploring and understanding these modern languages, you can broaden your toolkit and potentially find more efficient or effective ways to tackle your machine learning and AI tasks.

Remember, there's no one-size-fits-all solution in the world of programming. The best language for a task is often the one that you, as the developer or data scientist, feel most comfortable and productive using. So, don't be afraid to step out of your comfort zone and explore these modern languages. You might just discover a new favorite tool for your data science projects.

The list of modern languages for data science is constantly evolving, and many promising languages could be worth exploring. Stay tuned for part three of the list. If you have any suggestions or recommendations for languages that you think are worth mentioning, please feel free to share them in the comments section below or send me a message on LinkedIn. 📩

[![](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/cenzwong/)
