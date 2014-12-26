var app={
	flag:true,

	init:function(){
        $("#broadcast-interval").change(function() {
			var url = "http://127.0.0.1:8086/ble?callback=?";
            v = parseInt($("#broadcast-interval").val());
            $("#broadcast-interval-text").html(v+"秒钟");
			var deviceAddress=$('.scan-product-code>input[type="text"]').val();

            adv_param = Math.ceil((v * 1000 / 0.625));

            console.log("set broadcast interval to " + v + " s (" +
                        adv_param + ")");

			var params = {
			    address : deviceAddress,
			    resource : "/radio/advinterval",
			    operation : "write",
			    value: adv_param
			};
			$.getJSON(url,params,function(data){});
        });

        $("#tx-power").change(function() {
			var url = "http://127.0.0.1:8086/ble?callback=?";
            v = parseInt($("#tx-power").val());

            powers = [-30, -20, -16, -12, -8, -4, 0, 4];

            $("#tx-power-text").html(powers[v] + "db");
			var deviceAddress=$('.scan-product-code>input[type="text"]').val();

            console.log("set broadcast interval to " + v + " (" +
                        powers[v] + "db)");

			var params = {
			    address : deviceAddress,
			    resource : "/radio/txpower",
			    operation : "write",
			    value: v
			};
			$.getJSON(url,params,function(data){});
        });

		//事件委托  点击li
		app.device_list_click();

		$(".scan-product-code>.scan").click(function(){
			var url = "http://127.0.0.1:8086/ble?callback=?";

			//var url="http://www.gatt.io:8080/ble?callback=?";
			var params = {
			            address : "local",
			            resource : "/devices/nearby",
			            operation : "read",
			            settings :"low latency"
			        };
			$.getJSON(url,params,function(data){
				var devices = data['device_list'];

	            if (devices.length == 0) {
	                $(selector).html('no device found');
	                return;
	            }
	            //show alert-dialog
	            $("#alert-dialog").show(300);

	            //sort deives by rssi
	            var devicesSort=devices.sort(function(a,b){
	            	return Math.abs(a.rssi)-Math.abs(b.rssi);
	            })
	            
	            var deviceWrap=document.getElementById("deviceWrap");
	            
	            //empty deviceWrap
	            deviceWrap.innerHTML="";
	            
	            //render devicelist
	            devicesSort.forEach(function(item,index,arr){
	            	app.createLi(deviceWrap,"li",item);
	            })
	            
	            /*var rssiMax=devicesSort[0];

	            $('.scan-product-code>input[type="text"]').val(rssiMax.address);*/

			});
		})
		
		$(".set-lable-info").find("button").click(function(){
			if(app.flag){
				app.flag=false;

				var broadcastIntervalValue=broadcastInterval.value?broadcastInterval.value:3200;
				var txPowerValue=txPower.value?txPower.value:6;

				//发送数据给蓝牙接口

				//设置成功之后设置flag值为true

				var deviceAddress=$('.scan-product-code>input[type="text"]').val();

			    var params = {
			        address : deviceAddress,
			        resource : "/radio/txpower",
			        operation : "write",
			        value: txPower
			    };
			    $.getJSON(url,params,function(data){});

                app.flag = true;
			}
		})

		$(".setform>button").click(function(e){
			if(!isNaN(parseFloat($(this).siblings('input[name="price"]').val()))){
				var price=$(this).siblings('input[name="price"]').val();
			}
			var name=$(this).siblings('input[name="name"]').val();

			new ShowInfoToCanvas({"name":name,"price":price});
			
			e.preventDefault();
		})


		$(".exitBtn").click(function(){
			 $("#alert-dialog").hide(300);
		})
	},
	setValue:function(){
		$(this).siblings(".broadcast_val").html(this.value);
	},
	createLi:function(parentNode,tagName,item){
		if(parentNode.nodeType!==1){
			throw new Error("Invalid arguments");
		}else{
			var createTag=document.createElement(tagName);
			createTag.setAttribute("address",item.address);

			createTag.innerHTML='DA-><span class="DA">'+item.address+'</span>'+'&nbsp;&nbsp;RSSI-><span class="RSSI">'+item.rssi+'</span>'
			parentNode.appendChild(createTag);
		}
	},
	device_list_click:function(){
		$("#deviceWrap").click(function(e){
			var node=e.target;
			if(node.nodeType==1&&node.nodeName.toUpperCase()=="LI"){
				$('.scan-product-code>input[type="text"]').val(node.getAttribute("address"));
			}
		})
	}
};

//render canvas data model
var generalInfo=[
		["name","price"],["产品名称","产品价格"]
	]

var generalInfoOffset={
		price:{x:10,y:20,fillStyle:"black",font:"16px smalle"},
		name:{x:10,y:40,fillStyle:"black",font:"16px smalle"},
	}


function ShowInfoToCanvas(curLabel){
		var self=this;

		var ele=document.getElementById("mycanvas")
		if(!document.getElementById("mycanvas")){
			self.ele=document.createElement("canvas");
			self.ele.id="mycanvas";
			self.ele.width=232;
			self.ele.height=88;
		}else{
			self.ele=ele;
		}

		self.ele.className="mycanvas";

		document.getElementById("canvas-wrap").appendChild(self.ele);
		self.ctx=self.ele.getContext("2d");	
		self.W=self.ele.width;
		this.init(curLabel);
	}

	ShowInfoToCanvas.prototype.init=function(curLabel){
		var self=this;
		self.ctx.clearRect(0,0,self.ele.width,self.ele.height);

		for(var i=0;i<generalInfo[0].length;i++){		
			this.drawText(generalInfo[1][i]+"："+curLabel[generalInfo[0][i]],generalInfoOffset[generalInfo[0][i]]);					
		}

		this.sendData();
		
	}
	/*context.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh):选取图像的一部分矩形区域进行绘制

        image:Image对象var img=new Image(); img.src="url(...)";

        sx：图像上的x坐标

        sy：图像上的y坐标

        sw：矩形区域的宽度

        sh：矩形区域的高度

        dx：画在canvas的x坐标

        dy：画在canvas的y坐标

        dw：画出来的宽度

        dh：画出来的高度*/

	ShowInfoToCanvas.prototype.drawImage=function(img,obj){
		this.ctx.beginPath();
		this.ctx.drawImage(img,obj.x,obj.y);
		this.ctx.closePath();
	}

	ShowInfoToCanvas.prototype.sendData=function(){

		var imgData=this.ctx.getImageData(0,0,this.ele.width,this.ele.height);
		
		var tempArr=[],resultArr=[];

		for(var i=0,count=0,len=imgData.data.length;i<len;i++){
			if(i%4==3){
				if(count==8){
					count=0;
					resultArr.push(parseInt(tempArr.join(""), 2));
					tempArr=[];
				}
				if(imgData.data[i]){
					tempArr.push(1);
				}else{
					tempArr.push(0);
				}
				count++;
			}
		}
		//console.log(resultArr);

        var data = '[' + resultArr.toString() + ']';

        var deviceAddress=$('.scan-product-code>input[type="text"]').val();

		console.log(data);
        try{
        	window.memory.write("write_success" , "write_error" , deviceAddress, data);
        }catch(e){
        	console.log(e);
        }
	}
	ShowInfoToCanvas.prototype.drawText=function(textString,obj){
		this.ctx.beginPath();
		this.ctx.font=obj.font;
		this.ctx.fillStyle=obj.fillStyle;
		var text_w=this.ctx.measureText(textString).width;
		this.ctx.fillText(textString, obj.x, obj.y);
		this.ctx.closePath();
	}

$(function(){
	app.init();
})
