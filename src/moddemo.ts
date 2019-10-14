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