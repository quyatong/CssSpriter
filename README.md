CssSpriter
==========

Css Sprite Tool

It is a tool what can analyze CSS file and generate sprite map.

###Command Line

Install:   

```
npm install css-spriter -g
```


Usage:    

```
css-spriter index.css index-release.css
```
It will create a new css file.


You can also use as the follow:

```
css-spriter index.css
```
It will replace the old css file.
    
###Node.js

Install
```
npm install css-spriter --save-dev
```

Usage:

```
var cssSpriter = require('css-spriter');

cssSpriter('./index.css', './index-release.css').then(
    function () {
        do something...
    }
);

```
