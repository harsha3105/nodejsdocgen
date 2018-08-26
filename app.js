    //This function takes the input folder,unzips the components and finds the properties file.
//Subsequently, it puts the properties file in the temp folder with the appropriate name <component_name>uwproperties.properties
var async = require('async');
var officegen = require('officegen');
var fs = require('fs');
var path = require('path');
var uwProperties = null;
var templateKeysWithSubContent = ["properties", "events", "apis"];
var docTemplate = require('./config/template.json');
var docTheme = require('./config/theme.json');
var componentName="";
function unzipComponentsExtractUWPropFile() {
    
}
function addPropEventsAPIs(docx, x) {
    if (x == "properties") {
        printProperties(docx);
    }
    else if (x == "events") {
        printEvents(docx);
    }
    else if (x == "apis") {
        printAPIS(docx);
    }
}
function extractProperties() {
}
function extractEvents() {
}
function extractAPIs() {
    var generatedAPIDocContent = [];
    var apis = uwProperties.definitions.apis;
    var customAPIs = apis.custom;
    for (api in customAPIs) {
        var apiContent = {};
        apiContent["title"] = customAPIs[api].pw.displayName;
        apiContent["syntax"] = getSyntax(customAPIs[api]);
        apiContent["parameters"] = getParameters(customAPIs[api]);
        generatedAPIDocContent.push(apiContent);
    }
    return generatedAPIDocContent;
}
function getSyntax(api) {
    var propertyKey = api.propertyKey;
    var params = getParameters(api);
    var example = propertyKey + "(";
    if (params.length != 0) {
        for (param in params) {
            example = example + " " + params[param] + ",";
        }
        example = example.slice(0, -1);
    }
    example = example + ");"
    return example;
}
function getParameters(api) {
    var paramList = api.paramList;
    var params = [];
    for (param in paramList) {
        params.push(paramList[param]["name"]);
    }
    return params;
}

function printProperties(docx) {
    var properties = extractProperties();


}
function printEvents(docx) {
    var events = extractEvents();
}
function printAPIS(docx) {
    var apis = extractAPIs();
    console.log(apis);
    var apiTemplate = docTemplate.apis.template;
    for (count_api in apis) {
        var apiPrint = apis[count_api];
        var pObj = docx.createP();
        pObj.addText(apiPrint["title"], docTheme["sub-heading"]);
        pObj.addLineBreak();
        pObj.addText(apiTemplate.description.key, docTheme[apiTemplate.description["theme"]]);
        pObj.addLineBreak();
        pObj.addText(apiTemplate.description.placeholder, docTheme["placeholder"]);
        pObj.addLineBreak();
        pObj.addText(apiTemplate.syntax.key, docTheme[apiTemplate.syntax["theme"]]);
        pObj.addLineBreak();
        pObj.addText(apiPrint.syntax, docTheme[apiTemplate.syntax["content_theme"]]);
        addParameters(apiTemplate.parameters.key,apiTemplate.parameters["theme"],docx, apiPrint.parameters);
        pObj.addLineBreak();
        pObj.addText("MVC "+apiTemplate.example.key, docTheme[apiTemplate.example["theme"]]);
        pObj.addLineBreak();
        pObj.addText(apiTemplate.example.mvc_snippet+componentName+"."+apiPrint.syntax, docTheme[apiTemplate.example["content_theme"]]);
        pObj.addLineBreak();
        pObj.addText("Non-MVC "+apiTemplate.example.key, docTheme[apiTemplate.example["theme"]]);
        pObj.addLineBreak();
        pObj.addText(apiTemplate.example.non_mvc_snippet+componentName+"."+apiPrint.syntax, docTheme[apiTemplate.example["content_theme"]]);
   }
}
function addParameters(key ,theme,docx, parameters) {
    pObj = docx.createP();
    if (parameters.length > 0) {
        pObj.addText(key, docTheme[theme]);
        pObj.addLineBreak();
        for (param_count in parameters) {
            pObj.addText(parameters[param_count], docTheme.regular);
            pObj.addLineBreak();
        }
    }
}
function addDocContents(docx) {
    var docTheme = require('./config/theme.json');
    var docTemplate = require('./config/template.json');
    var pObj = docx.createP();;
    for (var x in docTemplate) {
        pObj.addText(docTemplate[x]["key"], docTheme.heading);
        console.log(docTemplate[x]["key"]);
        pObj = docx.createP();
        pObj.addText(docTemplate[x]["placeholder"], docTheme.placeholder);
        pObj = docx.createP();
        if (templateKeysWithSubContent.indexOf(x) != -1) {
           addPropEventsAPIs(docx, x);
        }
    }
}
function generateDocumentation(properties) {
    var docTheme = require('./config/theme.json');
    var docx = officegen({
        type: 'docx',
        orientation: 'portrait',
        pageMargins: { top: docTheme["top-margin"], left: docTheme["left-margin"], bottom: docTheme["bottom-margin"], right: docTheme["right-margin"] }
    });
    docx.on('error', function (err) {
        console.log(err);
    });
    var pObj = docx.createP();
    pObj = addDocContents(docx);
    var filePath = properties.outputFolder + "/" + componentName + ".docx";
    fs.open(filePath, 'w', function (err, file) {
        if (err) throw err;
        console.log('Saved!');
    });
    var out = fs.createWriteStream(filePath);
    out.on('error', function (err) {
        console.log(err);
    });

    async.parallel([
        function (done) {
            out.on('close', function () {
                console.log('Finished creating documentation.');
                done(null);
            });
            docx.generate(out);
        }

    ], function (err) {
        if (err) {
            console.log('error: ' + err);
        }
    });
}
function dumpDocIntoTempFolder() { }
function initLogger() {
    var log4js = require('log4js');
    var logger = log4js.getLogger();
    logger.level = 'debug';
    logger.debug("Initialized Logger");
    return logger;
}
function startDocGen() {
    var logger = initLogger();
    logger.info("Documentation generation starting...")
    var properties = require('./config/properties.json');
    if (properties.type === "zip") {
        //unzip
    }
    uwProperties = require(properties.pathToPropertiesFile);
    componentName = uwProperties.classname;
    generateDocumentation(properties);
}
startDocGen();

