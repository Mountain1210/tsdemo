/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2019-10-09 10:41:25
 * @version $Id$
 */

var a:string = "AI 深度学习,我们见面了"
console.log(a)
let element=document.createElement('div')
element.innerHTML=a
document.body.appendChild(element)

class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}

let greeter = new Greeter("world");