$(function(){
	$.ajax({
		url:"http://api.juma.io/hl_demo/labels/shops",
		type:"post",
		dataType:"json",
		success:function(result){
			result.shops.forEach(function(item,index,arr){
				var shopSelect=document.getElementById("shops");
				var curOption=document.createElement("option");
				curOption.value=item.shop;
				curOption.innerHTML=item.shop;

				if(index==0){
					curOption.checked=true;
				}
				shopSelect.appendChild(curOption);
			})


			$(".btn-group>a:eq(1)").click(function(){
				clearListLabelInfo();
				//再次点击清空列表

				if(flag){

					flag=false;

					$.ajax({
						url:"http://api.juma.io/hl_demo/labels",
						type:"get",
						data:{shop:document.getElementById("shops").value},
						dataType:"json",
						success:function(result){
							renderLabelCount(result.labels);
							result.labels.forEach(updateLabel);
						},
						error:function(msg){
							console.log(msg)
						}
					})
				}
			})
		},
		error:function(msg){
			console.log(msg);
		}
	})

	var flag=true;
	var curUpdataSucessCount=0,curUpdataFailedCount=0;
	

	var generalInfo=[
		["device_address","icon","goods_id","barcode","price","name","provider"],["蓝牙地址","图标","ID","条码","价格","名称","供应商"]
	]
	var generalInfoOffset={
		device_address:{x:10,y:20,fillStyle:"black",font:"16px smalle"},
		icon:{x:50,y:28,fillStyle:"black",font:"10px smalle"},
		goods_id:{x:116,y:36,fillStyle:"black",font:"10px smalle"},
		barcode:{x:10,y:56,fillStyle:"black",font:"12px smalle"},
		price:{x:116,y:56,fillStyle:"black",font:"12px  smalle"},
		name:{x:10,y:72,fillStyle:"black",font:"12px  smalle"},
		provider:{x:116,y:72,fillStyle:"black",font:"12px  smalle"},
		goods_logo:{x:10,y:36,font:"12px  '宋体'"}
	}
	//curLabel当前的标签
	function updateLabel(curLabel,index,arr){
		
		//比对版本 
		if(1){
			new ShowInfoToCanvas(curLabel);
		}
		
		//updateSuccess({id:"11",dianliang:"21",rssi:"-50"})
		
		//更新完毕
		if(index==(arr.length-1)){
			flag=true;
		}
	}

	function renderLabelCount(result){
		$("#labelInfo>li:eq(0)>span:eq(1)").html(result.length);
	}
	
	/*
	* eleLabel obj {id:"",dianliang:"",rssi:""}
	*/

	function updateSuccess(eleLabel){
		var curEleLabel=["<tr>",
			"<td>"+eleLabel.id+"</td>",
			"<td>"+eleLabel.dianliang+"</td>",
			"<td>"+eleLabel.rssi+"</td>",
		"</tr>"].join("");

		$("#success").append(curEleLabel);

		curUpdataSucessCount++;
		//更新个数
		$("#labelInfo>li:eq(1)>span:eq(1)").html(curUpdataSucessCount);

	}
	function updateFailed(eleLabel){
		var curEleLabel=["<tr>",
			"<td>"+eleLabel.id+"</td>",
			"<td>"+eleLabel.dianliang+"</td>",
			"<td>"+eleLabel.rssi+"</td>",
		"</tr>"].join("");
		
		$("#labelInfo>li:eq(2)>span:eq(1)").html(curUpdataFailedCount);
		$("#failed").append(curEleLabel);

	}


	//clearListLabelInfo
	function clearListLabelInfo(){
		curUpdataSucessCount=0;
		curUpdataFailedCount=0;
		$("#success>tbody:eq(0)>tr:gt(1)").remove();
		$("#failed>tbody:eq(0)>tr:gt(1)").remove();
	}

	function ShowInfoToCanvas(curLabel,canvasId){
		var self=this;

		
		self.ele=document.createElement("canvas");
		//self.ele.className="mycanvas";
		document.getElementById("canvas-wrap").appendChild(self.ele);

		self.ctx=self.ele.getContext("2d");	
		self.curLabel=curLabel;
		self.W=self.ele.width;

		this.init(curLabel);
	}

	ShowInfoToCanvas.prototype.init=function(curLabel){
		var self=this;

		for(var i=0;i<generalInfo[0].length;i++){
			if(generalInfo[0][i]=="icon"){
				(function(i){
					var img=new Image();
					img.onload=function(){
						self.drawText(generalInfo[1][i]+":",generalInfoOffset["goods_logo"]);
						self.drawImage(img,generalInfoOffset[generalInfo[0][i]]);
						arguments.callee=null;
					}
					img.src=curLabel.icon;
				})(i);
				
			}else{			
				this.drawText(generalInfo[1][i]+"："+curLabel[generalInfo[0][i]],generalInfoOffset[generalInfo[0][i]]);				
			}
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
		this.ele.parentNode.removeChild(this.ele);
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

		console.log(data);
		
		try{

			//updateSuccess({id:"11",dianliang:"21",rssi:"-50"})  write_success的回调
			//updateFailed({id:"11",dianliang:"21",rssi:"-50"})   write_error的回调
        	window.memory.write("write_success" , "write_error" , this.curLabel.device_address, data);
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
})
