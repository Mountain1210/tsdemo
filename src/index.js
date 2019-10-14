/**
 *
 * @authors Your Name (you@example.org)
 * @date    2019-10-09 10:41:25
 * @version $Id$
 */
var a = "Hello typescript,终于见面了";
console.log(a);
var element = document.createElement('div');
element.innerHTML = a;
document.body.appendChild(element);
var Greeter = /** @class */ (function () {
    function Greeter(message) {
        this.greeting = message;
    }
    Greeter.prototype.greet = function () {
        return "Hello, " + this.greeting;
    };
    return Greeter;
}());
var greeter = new Greeter("world");
