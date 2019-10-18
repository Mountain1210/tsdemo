class Person{
	name:string;
	constructor(name:string) {
		this.name=name;
	}
	greet(){
		alert('Hi my name is S{this.name}')
	}
	greetDelay(time:number){
		setTimeout(()=>{
			alert("1111")
		},time)
	}
}


/**
 * 正文
 */

class View{
	private _container:string;
	private _templateUrl:string;
	private _serviceUrl:string;
	private _age:any;

	constructor(config){
		this._container=config.container;
		this._templateUrl=config.templateUrl;
		this._serviceUrl=config.serviceUrl;
		this._age=config.age;
	}

	//下载Q.js; http://github.com/kriskowal/q
	private _loadJsonAsync(url:string,arge:any){
		return Q.Promise(function(resolve,reject){
			$.ajax({
				url:url,
				type:'get',
				dataType:'json',
				data:args,
				success:(json)=>{
					resolve(json);
				},
				error:(e)=>{
					reject(e);
				}
			})
		})
	}

	private _loadHbsAsync(url:string){
		return Q.Promise(function(resolve,reject){
			$.ajax({
				url:url,
				type:'get',
				dataType:'text',
				data:args,
				success:(hbs=>{
					resolve(hbs);
				},
				error:(e)=>{
					reject(e);
				}
			})
		})
	}

	private _compileHbsAsync(hbs:string){
		return Q.Promise(function(resolve,reject){
			try{
				var template:any=Handlebars.compile(hbs);
				resolve(template)
			}
			catch(e){
				reject(e)
			}
		})
	}

	private _jsonToHtmlAsync(template:any,json:any){
		return Q.Promise(function(resolve,reject){
			try{
				var html=template(json);
				resolve(html)
			}
			catch{
				reject(e)
			}
		})
	}


	private _appendHtmlAsync(html:string,container:string){
		return Q.Promise((resolve,reject)=>{
			try{
				var $container:any=$(container);
				if($container.length===0){
					throw new Error("container not fround!");
				}
				$container.html(html)
				resolve($container)
			}
			catch(e){
				reject(e)
			}
		})
	}

	public renderAsync(){
		return Q.Promise((resolve,reject)=>{
			try{
				var getJson=this._loadJsonAsync(this._serviceUrl,this._args);
				var getTemplate=this._loadHbsAsync(this._templateUrl).then(this._compileHbsAsync);

				Q.all([getJson,getTemplate]).then((results)=>{
					var json=results[0];
					var template=results[1]
					this._jsonToHtmlAsync(template,json)
					.then((html:string)=>{
						return this._appendHtmlAsync(html,this._container);
					})
					.then(($container:any)=>{
						resolve($container);
					})
				})
			}
			catch(e){
				reject(error)
			}
		})
	}
}


/////////////////////////////－－－－－分割线－－－－－////////////////////////////////////////////

/**
 * MVC模块重新复习
 */




class TaskModel extends Backbone.Model{
	public created:number;
	public completed:boolean;
	public title:string;
	constructor(){
		super()
	}
}

/**
 * 也有其它的类库不断承fetch方法
 */
// class TaskModel{
// 	public created:number;
// 	public completed:boolean;
// 	public title:string;
// }
// 

/**
 * collection 用来表示一组model
 */

class TaskCollection extends Backbone.Collection<TaskModel>{
	public model:TaskModel;
	construction(){
		this.model=TodoModel;
		super();
	}
}



/**
 * view 负责将存储在model中的数据渲染成HTML,view通常依赖在构造函数、属笥或设置中传入一个model、一个模板和容器。
 *
 * model和模板用来生成hmtl
 * 容器通常 是一个DOM元素选 择器，被 选 中的DOM元素作为HTML的容器
 * HTML将会被 插入或附加进去。
 */

class NavBarItemView extends Marionette.ItemView{
	constructor(option:any={}){
		option.template="#navBarItemViewTemplate";
		super(options)
	}
}



/**
 * collection view 迭代collection里面存储的model，使用item view 渲染它，然后将结果追 加到容器尾部
 *在主流框架中，渲染一个collection view实际上是为每一个collection中的model渲染一个item view,这可能会造成性能瓶颈。
 *一种替代的方案是，使用一个item view和一个属性为数组的model,然后使用{{# each}}语句在view的模板中渲染这个列表，而不是为collection中的每一个元素都渲染一个view.
 *
 */

class SampleCollectionVIew extends Marionette.CollectionVIew<SampleModel>{
		construction(options:any={}){
			super(options);
		}
}

var view=new SampleCollectionVIew({
	collection:collection,
	el:$("#divOutput"),
	childView:SampleView
})


/**
 * controller通常负责管理特定的model和相关view的生命周期。
 * 职责是实例化model和collection,将它们关联起，并与相关的view联系起来，在将控制权交给其他contgroller前销毁它们
 * MVC应用的交互是通过组织controller和它的方法。controller在需要的时候可以拥有许多方法，而这些方法和用户的行为一一对应。
 */

//下面为示例

class LikesController extends Chaplin.Controller{
	public beforeAction(){
		this.redirectUnlessLoggedIn();
	}

	public index(params){
		this.collection=new Likes();
		this.view =new LikesVIew({collection:this.collection});
	}

	public show(params){
		this.model=new Like({id:params.id});
		this.view=new FullLikeView({model:this.model});
	}
}


/**
 * 事件分为 用户事件 和 程序事件
 * 用户事件是指用户通过按钮鉵发
 * 程序事件是批应用自身也可以触发和处理一些事件。比如一些程序在view渲染触发onRender事件，或在controller的方法调用前触发onBeforeRouting事件。
 * 程序事件是遵循SOLID原则中的开/闭原则的一个好的方式。可以使用事件来允许开发者扩展框架，而不需要对框架做任何修改。
 * 程序事件也可以用来避免组件间的直接通信。
 * 
 */

/**
 * 路由和hash(#)导航
 * 路由负责观察URL的变更，并将程序的执行流切换到controller的相应方法上。
 * 主流框架使用了了一咱叫作hash导航的混合技术，它使用HTML5的History API在不重载页面的情况下处理页面URL的变更。
 * 在SPA中，链接通溃包含一个hash(#)字符。这个字符原本的设计是导航到页面的一个DOM元素上，但它被 MV*框架用来做无须刷新的导航。
 */
class Route{
	public controllerName:string;
	public actionName:string;
	public args:object[];

	construction(controllerName:string,actionName:string,args:Object[]){
		this.controllerName=controllerName;
		this.actionName=actionName;
		this.args=args;
	}
}


/**
 * 基本路由实现方式 
 */

class Router{
	private _defaultController:string;
	private _defaultAction:string;

	constructor(defaultController:string,defaultAction:string){
		this._defaultController=defaultController || "home";
		this_defaultAction=defaultAction || "index";
	}

	public initialize(){
		$(window).on('hashchange',()=>{
			var r=this.getRouter();
			this.onRouteChange(r)
		})
	}
	//读取URL
	private getRoute(){
		var h=window.location.hash;
		return this.parseRouter(h)
	}

	//解晰URL
	private parseRouter(hash:string){
		var comp,controller,action,args,i;
		if(hash[hash.length-1]===""){
			hash=hash.substgring(0,hash.length-1)
		}
		comp=hash.replace("#",'').split('');

		controller=comp[0] || this._defaultController;
		action=comp[1]||this._defaultAction;

		args=[];
		for(i=2; i<comp.length; i++){
			args.push(comp[i]);
		}

		return new Route(controller,action,args);
	}

	private onRouteChange(route:Route){
		//在这里执行控制器
		this.meditor.publish(new AppEvent("app.dispatch",route,null))
	}
}


/**
 * 中介器
 * 用来发布/订阅设计模式
 */

interface IMediator{
	publish(e:IAppEvent):void;
	subscribe(e:IAppEvent):void;
	unsubscribe(e:IAppEvent):void;
}

/**
 * 调度器
 */

class Dispatcher{
	public initialize(){
		this.meditor.subscribe(
				new AppEvent("app.dispatch",null,(e:any,data?:any)=>{
					this.dispatch(data);
				})
			)
	};

	private dispatch(route:IRoute){
		//1. 销毁旧的controller
		//2. 创建新的控制器实例
		//3. 通过中介器触发控制器的action
	}
}


//////////////自己制作MVC///////////////////////


/**
 * 程序事件
 */
interface IAppEvent{
	topic:string;
	data:any;
	handler:(e:any,data:any)=>void;
}
class AppEvent implements IAppEvent{
	public guid:string;
	public topic:string;
	public data:any;
	public handler:(e:Object,data?:any)=>void;

	constructor(topic:string,data:any,handler:(e:any,data?:any)=>void){
		this.topic=topic;
		this.data=data;
		this.handler=handler;
	}
}


/**
 * 中介器 实现
 */

interface IMediator{
	publish(e:IAppEvent):void;
	subscribe(e:IAppEvent):void;
	unsubscribe(e:IAppEvent):void;
}

class Mediator implements IMediator{
	private _$:JQuery;
	private _isDebug;

	construction(isDebug:boolean=false){
		this._$=$({});
		this._isDebug=isDebug;
	}

	public publish(e:IAppEvent):void{
		if(this._isDebug===true){
			console.log(new Date().getTime()),"PUBLISH",e.topic,e.data)
		}
		this._$.trigger(e.topic,e.data);
	}

	public subscribe(e:IAppEvent):void{
		if(this._isDebug===true){
			console.log(new Date().getTime(),'SUBSCRBE',e.topic,e.handler)
		}
		this._$.trigger(e.topic,e.handler)
	}

	public unsubscribe(e:IAppEvent):void{
		if(this._isDebug===true){
			console.log(new Date().getTime(),"UNSUBSCRIBE",e.topic,e.data)
		}
		this._$.off(e.topic)
	}
}

export{Mediator}

/**
 * 设计 程序组件
 * application类是整个应用的根组件，主要负责初始化框架的主要组件（路由、中介器和调度器）
 * interfaces.ts
 */

interface IAppSettings{
	isDebug:boolean,
	defaultController:string;
	defaultAction:string;
	controllers:Array<IControllerDetails>;
	onErrorHandler:(o:Object)=>void;
}

interface IControllerDetails{
	controllerName:string;
	controller:{new (...args:any[]):IController;}
}

import {Dispatcher} from "./dispatcher";
import {Mediator} from "./mediator";
import {AppEvent} from "./app_event";
import {Router} from "./router";

class App{
	private _dispatcher:IDispatcher;
	private _mediator:IMediator;
	private _router:IRouter;
	private _controllers:IControllerDetails[];
	private _onErrorHandler:(o:Object)=>void;

	constructor(appSettings:IAppSettings){
		this._controllers=appSettings.controllers;
		this._mediator=new Mediator(appSettings.isDebug || false);
		this._router=new Router(this._mediator,appSettings.defaultController,appSettings.defaultAction);
		this._dispatcher=new Dispatcher(this._mediator, this._controllers);
		this._onErrorHandler=appSettings.onErrorHandler;
	}

	public initialize(){
		this._router.initialize();
		this._dispatcher.initialize();
		this.mediator.subscribe(new AppEvent("app.error",null,(e:any,data?:any){
			this._onErrorHandler(data);
		}));
		this._mediator.publish(new AppEvent("app.initialize",null,null))
	}
}

export {App};


/**
 * 路由表
 */
interface IRoute{
	controllerName:string;
	actionName:string;
	args:Object[];
	serialize():string;
}

class Route implements IRoute{
	public controllerName:string;
	public actionName:string;
	public args:Object[];

	constructor(controllerName:string,actionName:string,args:Object[]){
		this.controllerName=controllerName;
		this.actionName=actionName;
		this.args=args;
	}

	public serialize():string{
		var s,sargs;
		sargs=this.args.map(a=>a.toString()).join("");
		s=`$(this.controllerName)/${this.actionName}/${sargs}`;
		return s;
	}
}
export{Route}

/**
 * 事件发射
 * event_emitter.ts
 */

interface IEventEmitter{
	triggerEvent(event:IAppEvent);
	subscribeToEvents(events:Array<IAppEvent>);
	unsubscribeToEvents(events:Array<IAppEvent>);
}

import {AppEvent} from "./app_event";


class EventEmitter implements IEventEmitter{
	protected _metiator:IMediator;
	protected _events:Array<IAppEvent>;

	constructor(metiator:IMediator){
		this._metiator=metiator;
	}

	public triggerEvent(event:IAppEvent){
		this._metiator.publish(event);
	}

	public subscribeToEvents(events:Array<IAppEvent>){
		this._events=events;
		for(var i=0; i<this._events.length; i++){
			this._metiator.subscribe(this_events[i]);
		}
	}

	public unsubscribeToEvents(){
		for(var i=0; i<this._events.length; i++){
			this._metiator.unsubscribe(this._events[i]);
		}
	}
}
export { EventEmitter };


interface IRouter extends IEventEmitter{
	initialize():void;
}

/**
 * 路由实现
 */

class Router extends EventEmitter implements IRoute{
	private _defaultController:string;
	private _defaultAction:string;

	constructor(metiator:IMediator,defaultController:string,defaultAction:string){
		super(metiator);
		this._defaultController=defaultController || "home";
		this._defaultAction=defaultAction || "index";
	}

	public initialize(){
		$(window).on('hashchange',()=>{
			var r=this.getRoute();
			this.onRouteChange(r)
		});
		this.subscribeToEvents([
			new AppEvent("app.initialize",null,(e:any,data?:any)=>{
				this.onRouteChange(this.getRoute())
				})
			,new AppEvent("app.route",null,(e:any,data?:any)=>{
				this.setRoute(data);
				})
			])
	}

	private getRoute(){
		var h=window.location.hash;
		return this.parseRoute(h);
	}

	//改变URL
	private setRoute(route:Route){
		var s=route.serialize();
		window.location.hash=s;
	}

	//解晰URL

	private parseRoute(hash:string){
		var comp,controller,action,args,i;
		if(hash[hash.length-1]===""){
			hash=hash.substring(0,hash.length-1);
		}

		comp=hash.replace("#",'').split('');
		controller=comp[0] || this._defaultController;
		action=comp[1] || this._defaultAction;

		args=[];
		for(i=2; i<comp.length; i++){
			args.push(comp[i])
		}
		return new Route(controller,action,args);
	}

	private onRouteChange(route:Route){
		this.triggerEvent(new AppEvent("app.dispatch",route,null))
	}
}

export { Router };


/**
 * 调度器职责就是避免有很多controller，对内存的占用就会变成性能问题
 */
interface IDispatcher extends IEventEmitter{
	initialize():void;
}

class Dispatcher extends EventEmitter implements IDispatcher{
	private _controllersHashMap:Object;
	private _currentController:IController;
	private _currentControllerName:string;

	constructor(metiator:IMediator,controllers:IControllerDetails[]){
		super(metiator);
		this._controllersHashMap=this.getController(controllers);
		this._currentController=null;
		this._currentControllerName=nulll;
	}

	public initialize(){
		this.subscribeToEvents([
				new AppEvent("app.dispatch",null,(e:any,data?:any)=>{
					this.dispatch(data);
				})
			])
	}

	private getController(controllers:IControllerDetails[]):Object{
		var hashMap,hashMapEntry,name,controller,l;;

		hashMap={};
		l=controllers.length;
		if(l<=0){
			this.triggerEvent(new AppEvent("app.error","cannot create an application without at least one contoller.",null))
			for(var i=0; i<1; i++){
				controller=controllers[i];
				name=controller.controllerName;
				hashMapEntry=hasMap[name];

				if(hashMapEntry!==null && hashMapEntry !== undefined){
					this.triggerEvent(new AppEvent(
							"app.error",
							"Two controller cannot use the same name.",
							null
						))
				}
			}
		}
	}

	private dispatch(route:IRoute){
		var Controller = this._controllersHashMap[route.controllerName];

		//试图发现controller

		if(Controller===null || controller ===undefined){
			this.triggerEvent(new AppEvent(
				"app.error",
				`Controller not found:${route.controllerName}`,
				null	
				))
		}
		else{
			//创建一个controller实例
			var controller:IController =new Controller(this._metiator);

			//该行为不可用
			var a=controller[route.actionName];
			if(a===null || a===undefined){
				this.triggerEvent(new AppEvent(
						"app.error",
						`Acton not found in controller:${route.controllerName} - }${route.actionNmae}`,
						null
					))
			}
			else{ //该行为可用
				if(this._currentController ==null ){
					//初始化controller
					this._currentControllerName=route.controllerName;
					this._currentController=controller;
					this._currentController.initialize();
				}
				else{
					//若之前的controller不再需要，则销毁
					if(this._currentControllerName !== route.controllerName){
						this._currentController.dispose();
						this._currentControllerName=route.controllerName;
						this._currentController=controller;
						this._currentController.initialize();

					}
				}
				this.triggerEvent(new AppEvent(
						`app.controller.${this._currentControllerName}.${route.actonName}`,
						route.args,
						null
					));

			}
		}
	}
}

export { Dispatcher }

/**
 * controller
 */

interface IController extends IEventEmitter{
	initialize():void;
	dispose():void;
}

class Controller extends EventEmitter implements IController{
	constructor(metiator:IMediator){
		super(metiator);
	}

	public initialize():void{
		throw new Error('Controller.prototype.initialize() is abstract you must implement it!');		
	}

	public dispose():void{
		throw new Error('Controller.prototype.dispose() is abstract you must implement it!');
	}
}

export { COntroller }

/**
 * model和model settings
 * model被用来与网络服务进行通信，并格式化它返回的数据。
 * model可以让我们读取格式化、更新或删除从服务器返回的数据。
 * model实现了IModel和IEventEmitter接口
 */
interface IModel extends IEventEmitter{
	initialize():void;
	dispose():void;
}

function ModelSettings(sericeUrl:string){
	return functioon(target:any){
		//保存原构造函数的引用
		var original =target;
		//一个用于生成类实例的工具函数
		function construct(constructor,args){
			var c:any=function(){
				return constructor.apply(this,args);
			}
			c.prototype=constructor.prototype;
			var instance=new c();
			instance._serviceUrl=serviceUrl;
			return instance;
		}
		//新构造函数的行为
		var f:any=function(...args){
			return construct(original,args)
		}

		f.prototype=original.prototype;

		return f;
	}
}

class NasdaqModel extends Model implements IModel{

}


class Model extends EventEmitter implements IModel{
	private _serviceUrl:string;
	constructor(metiator:IMediator){
		super(metiator);
	}

	//必须由派生类来实现
	public initialize(){
		throw new Error('Model.prototype.initialize() is abstract and must implemented.');
	}

	//必须由派生类来实现

	public dispose(){
		throw new Error('Model.prototype.dispose() is abstract and must implemented.')
	}

	protected requestAsync(method:string,dataType:string,data){
		return Q.Promise((resolve:(r)=>{},reject:(e)=>{})=>{
			$.ajax({
				method:method,
				url:this._serviceUrl,
				data:data || {},
				dataType:dataType,
				success:(response)=>{
					resolve(response);
				},
				error:(...args:any[])=>{
					reject(args);
				}
			})
		})
	}

	protected getAsync(dataType:string,data:any){
		return this.requestAsync("get",dataType,data)
	}

	protected postAsync(dataType:string,data:any){
		return this.requestAsync("post",dataType,data)
	}

	protected putAsync(dataType:string,data:any){
		return this.requestAsync("put",dataType,data)
	}

	protected deleteAsync(dataType:string,data:any){
		return this.requestAsync("delete",dataType,data)
	}
}
export { MOdel,ModelSettings}

/**
 * View和view settings
 */

interface IView extends IEventEmitter{
	initialize():void;
	dispose():void;
}

function VIewSettings(templateUrl:string, container:string){
	return function(target:any){
		//保存原构造函数的引用 
		var original=target;

		//一个用于生成类实例的工具函数
		function construct(constructor,args){
			var c:any=function(){
				var c:any=function(){
					return constructor.apply(this,args)
				}

				c.prototype=constructor.prototype;
				var instance =new c();
				instance._container=container;
				instance.templateUrl=templateUrl;

				return instance;
			}

			//新构造函数的行为
			var f:any=function(...args){
				return construct(original,args);
			}

			//为了使instanceof操作符继续可用，复制原型

			f.prototype=original.prototype;

			//返回新的构造函数(覆盖原来的)
			return f;
		}
	}
}


/**
 * view
 */

class View extends EventEmitter implements IView{
	//_container和_templateUrl的值 必须使用ViewSettings装饰器设置
	protected _container:string;
	private _templateUrl:string;
	private _templateDelegate:HandlebarsTemplateDelegate;

	constructor(metiator:IMediator){
		super(metiator);
	}

	//必须由派生类来实现
	public initialize(){
		throw new Error('View.prototype.initialize() is abstract and must implemented.');
	}

	//必须由派生类来实现
	public dispose(){
		throw new Error('View.prototype.dispose() is abstract and must implemented.');
	}

	//必须由派生类来实现

	protected bindDomEvents(model:any){
		throw new Error('View.prototype.dispose() is abstract and must implemented.');	
	}

	//必须由派生类来实现
	protected unbindDomEvents(model:any){
		throw new Error('View.prototype.dispose() is abstract and must implemented.');	
	}

	//异步加载模板
	private loadTemplateAsync(){
		return Q.Promise((resolve:(r)=>{},reject:(e)=>{})=>{
			$.ajax({
				method:method,
				url:this._templateUrl,
				dataType:"text",
				success:(response)=>{
					resolve(response);
				},
				error:(...args:any[])=>{
					reject(args);
				}
			})
		})
	}

	//异步编译模板
	private compileTemplateAsync(source:string){
		return Q.Promise((resolve:(r)=>{},reject:(e)=>{})={
			try{
				var template=Handlebars.comile(source);
				resolve(template);
			}
			catch(e){
				reject(e)
			}
		})
	}

	//若操作仍完成，则异步加载和编译一个模板
	private getTemplateAsync(){
		return Q.Promise((resolve:(r)=>{},reject:(e)=>{})=>{
			if(this._templateDelegate===undefined || this.+templateDelegate===null){
				this.loadTemplateAsync()
				.then((source)=>{
					return this.compileTemplateAsync(source);
				})
				then((templateDelegate)=>{
					this._templateDelegate=templateDelegate;
					resolve(this._templateDelegate);
				})
				.catch((e)=>{reject(e);
				});
			}
			else{
				resolve(this._templateDelegate);
			}
		})
	}

	//异步渲染一个view
	protected renderAsync(model){
		return Q.Promise((resolve:(r)=>{},reject:(e)=>{})=>{
			this.getTemplateAsync()
			.then((templateDelegate)=>{
				//生成HTML并添加到DOM中
				var html=this._templateDelegate(model);
				$(this._container).html(html);

				//将model作为参数传给model
				//让子视图和DOM事件初始化
				resolve(model);
			})
			.catch((e)=>{reject(e);})
		})
	}
}
export{ View,ViewSetting; }
