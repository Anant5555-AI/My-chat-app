"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_api_lib_db_mongo_js";
exports.ids = ["_api_lib_db_mongo_js"];
exports.modules = {

/***/ "(api)/./lib/db/mongo.js":
/*!*************************!*\
  !*** ./lib/db/mongo.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getDb: () => (/* binding */ getDb)\n/* harmony export */ });\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongodb */ \"mongodb\");\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongodb__WEBPACK_IMPORTED_MODULE_0__);\n\nconst uri = process.env.MONGODB_URI || \"mongodb+srv://anantanand900:anantanand900@cluster0.lx3wgs5.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0\";\nlet client;\nlet clientPromise;\nif (!global._mongoClientPromise) {\n    client = new mongodb__WEBPACK_IMPORTED_MODULE_0__.MongoClient(uri);\n    global._mongoClientPromise = client.connect();\n}\nclientPromise = global._mongoClientPromise;\nasync function getDb() {\n    const client = await clientPromise;\n    return client.db();\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9saWIvZGIvbW9uZ28uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXNDO0FBRXRDLE1BQU1DLE1BQU1DLFFBQVFDLEdBQUcsQ0FBQ0MsV0FBVyxJQUFJO0FBRXZDLElBQUlDO0FBQ0osSUFBSUM7QUFFSixJQUFJLENBQUNDLE9BQU9DLG1CQUFtQixFQUFFO0lBQy9CSCxTQUFTLElBQUlMLGdEQUFXQSxDQUFDQztJQUN6Qk0sT0FBT0MsbUJBQW1CLEdBQUdILE9BQU9JLE9BQU87QUFDN0M7QUFFQUgsZ0JBQWdCQyxPQUFPQyxtQkFBbUI7QUFFbkMsZUFBZUU7SUFDcEIsTUFBTUwsU0FBUyxNQUFNQztJQUNyQixPQUFPRCxPQUFPTSxFQUFFO0FBQ2xCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXktY2hhdC1hcHAtd2ViLy4vbGliL2RiL21vbmdvLmpzPzYxNWMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9uZ29DbGllbnQgfSBmcm9tIFwibW9uZ29kYlwiO1xyXG5cclxuY29uc3QgdXJpID0gcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkkgfHwgXCJtb25nb2RiK3NydjovL2FuYW50YW5hbmQ5MDA6YW5hbnRhbmFuZDkwMEBjbHVzdGVyMC5seDN3Z3M1Lm1vbmdvZGIubmV0L2NoYXRhcHA/cmV0cnlXcml0ZXM9dHJ1ZSZ3PW1ham9yaXR5JmFwcE5hbWU9Q2x1c3RlcjBcIjtcclxuXHJcbmxldCBjbGllbnQ7XHJcbmxldCBjbGllbnRQcm9taXNlO1xyXG5cclxuaWYgKCFnbG9iYWwuX21vbmdvQ2xpZW50UHJvbWlzZSkge1xyXG4gIGNsaWVudCA9IG5ldyBNb25nb0NsaWVudCh1cmkpO1xyXG4gIGdsb2JhbC5fbW9uZ29DbGllbnRQcm9taXNlID0gY2xpZW50LmNvbm5lY3QoKTtcclxufVxyXG5cclxuY2xpZW50UHJvbWlzZSA9IGdsb2JhbC5fbW9uZ29DbGllbnRQcm9taXNlO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERiKCkge1xyXG4gIGNvbnN0IGNsaWVudCA9IGF3YWl0IGNsaWVudFByb21pc2U7XHJcbiAgcmV0dXJuIGNsaWVudC5kYigpO1xyXG59XHJcblxyXG5cclxuIl0sIm5hbWVzIjpbIk1vbmdvQ2xpZW50IiwidXJpIiwicHJvY2VzcyIsImVudiIsIk1PTkdPREJfVVJJIiwiY2xpZW50IiwiY2xpZW50UHJvbWlzZSIsImdsb2JhbCIsIl9tb25nb0NsaWVudFByb21pc2UiLCJjb25uZWN0IiwiZ2V0RGIiLCJkYiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(api)/./lib/db/mongo.js\n");

/***/ })

};
;