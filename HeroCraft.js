//////////////////////////////////////////////////////////////////////////////////////////////////
//전역 변수 선언
var context; /*컨텍스트 객체*/
var ball; /*공 객체*/
var bar; /*바 객체*/
var timer; /*타이머 객체 변수*/
//프레임 계산 변수-> 보스 몬스터의 무적시간 위해 필요
var timerSecond=1; //매 프레임마다 1증가 (3의 배수일때 보스가 움직이고, 3의 배수가 아닐때 공이 움직임)
var timerMemoryWork=false;
var timerMemory=0;
var timerIsStoped=true; /*타이머 정지됨?*/
var canvasWidth=600; /*캔버스의 가로px*/
var canvasHeight=600; /*캔버스의 세로px*/
var totalIsCrashed_vertical=false; /*각 프레임에서 충돌 여부*/ //동시 충돌문제를 해결하기 위하여 도입
var totalIsCrashed_horizental=false;
var blockWidth=60;
var blockHeight=30;
var blockMargin=10;
var score=0; //점수
var life=5; //목숨
var frameMS=40; //각 프레임 변경 밀리초
var skill_num = 2;//스킬 사용 가능 개수
var stage2_boss_hp = 21;
var stage3_boss_hp = 37;
var stage2_boss_headHit=false;
var stage3_boss_hit=false;
//issue 1 : need to change the default value of img src
var imgsrc = "image/ball/ironpickaxe.png";
var skinsrc = "image/bar/skin1.jpg";

//game
var clear = false;

var backgroundMusic;
//1단계 
var stage1_brick = new Array(5);
for(var i = 0;i<stage1_brick.length;i++){
   stage1_brick[i] = new Array(7);
}
var stage1_tower = new Array(2);
for(var i = 0;i<stage1_tower.length;i++){
   stage1_tower[i] = new Array(4);
}
//2단계
var stage2_boss=new Array(5);
var stage2_brick = new Array(7);
//3단계
//위더 머리 3개 갈비뼈 3개 몸통 1개 목 1개

var stage3_boss = new Array(8);


//variable for checking if the game ends;
var crashedBlock = 0;

//total number of blocks per stage
var stage1_block_num = 43;
var stage2_block_num = 13;
var stage3_block_num = 8;

var weaponStr = "ironpickaxe";
var skinStr = "skin1";
var getWeaponStatus = false;
var getSkinStatus = false;

//////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////////////
//객체 생성자 함수

function Ball(position_x,position_y,radius,delta_x,delta_y,imageFile){
	this.position_x=position_x; /*공의 현재 x 위치*/
	this.position_y=position_y; /*공의 현재 y 위치*/
	this.radius=radius; /*공의 반지름*/
	this.delta_x=delta_x; /*공의 현재 x방향 변위 */ //속도는 5의 배수여야함
	this.delta_y=-delta_y; /*공의 현재 y방향 변위*/
	this.image=new Image(); 
	this.image.src=imageFile;
	this.skillReady=false; /*공의 달라붙기 스킬 준비 유무*/
	this.isAttached=false; /*공이 달라붙었을 경우*/
	this.temp_delta_x;
	this.temp_delta_y; //공의 직전 변위 값 저장 -> 스킬 위해 필요



	/*공의 충돌 이벤트를 처리한다. (공&벽면, 공&바 의 충돌) */
	this.checkCrash=function(){
		if(life==0){
        	clearInterval(timer);
        	alert("Game Over\nScore : "+score);
        	var a=document.getElementById("setting_screen");
			a.style.display = "none";
			var b=document.getElementById("screen_main");
			b.style.display = "block";
			var c=document.getElementById("content");
			c.style.display = "block";
			var d=document.getElementById("canvas");
			button_stop();
			d.hidden = true;
	        var hp = document.getElementById("hp");
         	hp.style.display = "none";

        }
        var crashWithCanvasBorder=false; //캔버스 아래로 떨어지는건 처리안함, 따로 처리필요
		//화면 아랫 벽면과 충돌->이떄 무적상태(스킬 자동사용)
         if(ball.position_y+ball.radius*2>canvasHeight){
            life--;
            ball.skillReady=true;
            ball.position_y = bar.position_y-ball.radius*2;
            ball.position_x=bar.position_x+bar.width/2-ball.radius;
            skill_num+=1;
            playEventMusic("music/inGame/hit1.ogg");
        }
			
		//화면 윗 벽면과 충돌
		if(ball.position_y<0){
			if(totalIsCrashed_vertical==false) ball.delta_y=-ball.delta_y;
			totalIsCrashed_vertical=true;
			 crashWithCanvasBorder=true;
		}

		//화면 왼쪽 벽면과 충돌
		if(ball.position_x<0){
			if(totalIsCrashed_horizental==false) ball.delta_x=-ball.delta_x;
			totalIsCrashed_horizental=true;
			crashWithCanvasBorder=true;
		}
		//화면 오른쪽 벽면과 충돌
		if(ball.position_x>canvasWidth-ball.radius*2){
			if(totalIsCrashed_horizental==false) ball.delta_x=-ball.delta_x;
			totalIsCrashed_horizental=true;
			crashWithCanvasBorder=true;
		}
		if(crashWithCanvasBorder) playEventMusic("music/inGame/crashWithCanvasBorder.ogg");

		//바와 충돌  //바와 충돌할때 Vy를 rand으로 제공하자 일단은 상수 제공 ->이걸 아이템으로 해결해도 될듯
		if(ball.position_x+ball.radius*2>=bar.position_x&&ball.position_x<=bar.position_x+bar.width
			&&ball.position_y+ball.radius*2>=bar.position_y&&ball.position_y<=bar.position_y+bar.height){
			//바의 붙잡기 스킬이 없을때
			if(ball.skillReady==false){
				if(totalIsCrashed_vertical==false) ball.delta_y=-ball.delta_y;
				totalIsCrashed_vertical=true;
				playEventMusic("music/inGame/weak2.ogg");
			} 
			//바의 붙잡기 스킬이 있을때
			else{
				ball.temp_delta_x=ball.delta_x;
				ball.temp_delta_y=ball.delta_y;
				ball.delta_x=0;
				ball.delta_y=0;
				ball.position_y-=5; //계속 충돌되는 현상 피하기 위하여 필요합.
				ball.isAttached=true;
			}
				
		}
			
	}
}


function Bar(position_x,position_y,width,height,imageFile){
	this.position_x=position_x;
	this.position_y=position_y;
	this.width=width;
	this.height=height;
	this.image=new Image();
	this.image.src=imageFile;
}

function Block(position_x,position_y,width,height,stiffness,imageFile){ //이미지 파일은 brick+((생략)stiffness).png //stiff>0까지만 유효, stiff<=0은 이미지 없음
	this.position_x=position_x;
	this.position_y=position_y;
	this.width=width;
	this.height=height;
	this.stiffness=stiffness;
	this.imageFile=imageFile; //블럭에 따른 소리 재생을 위해 이용됨(각 블록은 고유의 이미지 경로를 지닌다.)
	this.image=new Image();
	this.image.src=imageFile+stiffness+".png";
	/*공과의 충돌 이벤트를 처리한다. (공&벽돌 의 충돌) */
	this.checkCrash=function(){
		if(this.stiffness>0){
			var isCrashed=false;
			//벽돌의 윗면으로 충돌하였을 때
         	if(ball.position_x+ball.radius*2>=this.position_x&&ball.position_x<=this.position_x+this.width&&ball.position_y+ball.radius*2==this.position_y){
            	if(totalIsCrashed_vertical==false) ball.delta_y=-ball.delta_y;
           			isCrashed=true;
            		totalIsCrashed_vertical=true;
            		score+=10;
           	}
	        //벽돌의 아랫면으로 충돌하였을 때
	        if(ball.position_x+ball.radius*2>=this.position_x&&ball.position_x<=this.position_x+this.width&&ball.position_y==this.position_y+this.height){
	        	if(totalIsCrashed_vertical==false) ball.delta_y=-ball.delta_y;
	            isCrashed=true;
	            totalIsCrashed_vertical=true;
	            score+=10;
	        } 
	        //벽돌의 왼쪽면으로 충돌하였을 때
	        if(ball.position_y+ball.radius*2>=this.position_y&&ball.position_y<=this.position_y+this.height&&ball.position_x+ball.radius*2==this.position_x){
	        	if(totalIsCrashed_horizental==false) ball.delta_x=-ball.delta_x;
	            isCrashed=true;
	            totalIsCrashed_horizental=true;
	            score+=10;
	        }
	        //벽돌의 오른쪽면으로 충돌하였을 때
	        if(ball.position_y+ball.radius*2>=this.position_y&&ball.position_y<=this.position_y+this.height&&ball.position_x==this.position_x+this.width){
	            if(totalIsCrashed_horizental==false) ball.delta_x=-ball.delta_x;
	            isCrashed=true;
	            totalIsCrashed_horizental=true;
	            score+=10;
	        }
			
			if(isCrashed==true&&this.stiffness>0){
				this.stiffness--;
				if(this.stiffness==0) {
					crashedBlock++;
					this.image.src="image/null.png";
					//돌이라면 소리내기
					if(this.imageFile=="image/block/normalBlock/stone/stone"){
						playEventMusic("music/inGame/break"+".ogg");
					}
					else if(this.imageFile=="image/block/normalBlock/brick/brick"){
						playEventMusic("music/inGame/break6.ogg");
					}
					else if(this.imageFile=="image/block/normalBlock/door/door_up"||this.imageFile=="image/block/normalBlock/door/door_down"){
						playEventMusic("music/inGame/open1.ogg");
					}
					else{
						playEventMusic("music/inGame/break10.ogg");
					}
				}else{
					this.image.src=imageFile+this.stiffness+".png";
					//돌이라면 소리내기
					if(this.imageFile=="image/block/normalBlock/stone/stone"){
						playEventMusic("music/inGame/stone"+stiffness+".ogg");
					}	
					else if(this.imageFile=="image/block/normalBlock/brick/brick"){
						playEventMusic("music/inGame/break"+stiffness+".ogg");
					}
					else if(this.imageFile=="image/block/normalBlock/door/door_up"||this.imageFile=="image/block/normalBlock/door/door_down"){
						playEventMusic("music/inGame/open1.ogg");
					}
					else{
						playEventMusic("music/inGame/break10.ogg");
					}
				}
				
			}

			
			
		}
	}
}

function BossBlock(position_x,position_y,width,height,stiffness,normalImageFile,redImageFile){ //이미지 파일은 brick+((생략)stiffness).png //stiff>0까지만 유효, stiff<=0은 이미지 없음
   this.position_x=position_x;
   this.position_y=position_y;
   this.width=width;
   this.height=height;
   this.stiffness=stiffness;
   this.normalImage=new Image();
   this.normalImage.src=normalImageFile+".png";
   this.redImage=new Image();
   this.redImage.src=redImageFile+".png";
   this.criticalImage=new Image();
   this.criticalImage.src="image/boss/head_red.png";
   this.isRed=false;
   var hp = document.getElementById("hp");
   //this.image.src=imageFile+stiffness+".png";
   /*공과의 충돌 이벤트를 처리한다. (공&벽돌 의 충돌) */
   this.checkCrash=function(){
	    if(this.stiffness>0){
	    	var isCrashed=false;
			//벽돌의 윗면으로 충돌하였을 때
         	if(ball.position_x+ball.radius*2>=this.position_x&&ball.position_x<=this.position_x+this.width&&ball.position_y+ball.radius*2==this.position_y){
            	if(totalIsCrashed_vertical==false) ball.delta_y=-ball.delta_y;
           			isCrashed=true;
            		totalIsCrashed_vertical=true;
           	}
	        //벽돌의 아랫면으로 충돌하였을 때
	        if(ball.position_x+ball.radius*2>=this.position_x&&ball.position_x<=this.position_x+this.width&&ball.position_y==this.position_y+this.height){
	        	if(totalIsCrashed_vertical==false) ball.delta_y=-ball.delta_y;
	            isCrashed=true;
	            totalIsCrashed_vertical=true;
	        } 
	        //벽돌의 왼쪽면으로 충돌하였을 때
	        if(ball.position_y+ball.radius*2>=this.position_y&&ball.position_y<=this.position_y+this.height&&ball.position_x+ball.radius*2==this.position_x){
	        	if(totalIsCrashed_horizental==false) ball.delta_x=-ball.delta_x;
	            isCrashed=true;
	            totalIsCrashed_horizental=true;
	        }
	        //벽돌의 오른쪽면으로 충돌하였을 때
	        if(ball.position_y+ball.radius*2>=this.position_y&&ball.position_y<=this.position_y+this.height&&ball.position_x==this.position_x+this.width){
	            if(totalIsCrashed_horizental==false) ball.delta_x=-ball.delta_x;
	            isCrashed=true;
	            totalIsCrashed_horizental=true;
	        }
	        
	        
	        
	        //충돌 하였을 경우 이미지 변경(무적상태가 아닐때)
	        if(isCrashed==true&&this.stiffness>0&&timerMemoryWork==false){
	         	if(this.isRed==false){
	         		this.stiffness--;
	         		//만일 2단계 보스의 머리였다면 stiffness를 2추가로 감소시킨다. -> 치명타
	         		if(this.normalImage.src=="image/boss/head.png") {
	         			this.stiffness-=2;
	         			stage2_boss_headHit=true;
	         		}
	         		hp.value -=1;
	         		score+=15;
	         		//빨개지는 것 구현
	            	this.isRed=true;
	            	stage3_boss_hit=true;
	         	} 
	        }
	        if(this.stiffness==0) {
				//블럭이 부서지면 부서진 블록의 개수를 증가시킨다.
				crashedBlock++;
	            this.normalImage.src="image/null.png";
	            this.redImage.src="image/null.png";
	        }
	    }
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////////////////////////////////////////////////////////////////
//일반 함수

/*스테이지 1 객체 초기화를 담당하는 함수*/
function initStage1(){
	context=document.getElementById("canvas").getContext("2d");
	ball=new Ball(210,canvasHeight-95,20,5,-5,imgsrc); //공의 속도는 5이여야 한다.(충돌 조건)
	bar=new Bar(190,canvasHeight-20,100,5,skinsrc);
	
	for(var i = 0; i<5;i++){
      for(var j = 0; j<7;j++){
      	if(i>=2&&j>=2&&j<=4){
      		if(j==3){
      			if(i==3) {
      				stage1_brick[i][j] = new Block(60+(blockWidth+blockMargin)*j,140+(blockHeight+blockMargin)*i,blockWidth,blockHeight,1,"image/block/normalBlock/door/door_up");
      			}
      			else if(i==4)
      			{
      				stage1_brick[i][j] = new Block(60+(blockWidth+blockMargin)*j,140+(blockHeight+blockMargin)*i,blockWidth,blockHeight,1,"image/block/normalBlock/door/door_down");
      			}
      			else{
      				stage1_brick[i][j] = new Block(60+(blockWidth+blockMargin)*j,140+(blockHeight+blockMargin)*i,blockWidth,blockHeight,2,"image/block/normalBlock/stone/stone");
      			}
      		} else{
      			stage1_brick[i][j] = new Block(60+(blockWidth+blockMargin)*j,140+(blockHeight+blockMargin)*i,blockWidth,blockHeight,2,"image/block/normalBlock/stone/stone");
      		}
      	}
      	else {
      		stage1_brick[i][j] = new Block(60+(blockWidth+blockMargin)*j,140+(blockHeight+blockMargin)*i,blockWidth,blockHeight,3,"image/block/normalBlock/brick/brick");
      	}
      }
  	}
  	var k=0; var k1=0;
  	for(var i=0;i<stage1_tower.length;i++){
      for(var j =0;j<stage1_tower[i].length;j++){
      	
        if(i==0){
         	if(j%2==1){
         		stage1_tower[i][j] = new Block(60+(blockWidth+blockMargin)*j+k*3*(blockWidth+blockMargin),60+(blockHeight+blockMargin)*i,blockWidth,blockHeight,1,"image/block/normalBlock/fence/fence_right");
         	}
         	else{
         		stage1_tower[i][j] = new Block(60+(blockWidth+blockMargin)*j+k*3*(blockWidth+blockMargin),60+(blockHeight+blockMargin)*i,blockWidth,blockHeight,1,"image/block/normalBlock/fence/fence_left");
         	}
         	if(j>=1) k=1;
         	else k=0;
        }
        else{
         	stage1_tower[i][j] = new Block(60+(blockWidth+blockMargin)*j+k1*3*(blockWidth+blockMargin),60+(blockHeight+blockMargin)*i,blockWidth,blockHeight,2,"image/block/normalBlock/brick/brick");
         	if(j>=1) k1=1;
         	else k1=0;
        }
      }
    }
	clear = false;
	crashedBlock = 0;
	drawCanvasStage1();
	// playBackgroundMusic("music/calm1.ogg");
}

/*스테이지 2 객체 초기화를 담당하는 함수*/
function initStage2(){
	timerSecond=0;
	timerMemoryWork=false;
	timerMemory=0;
	context=document.getElementById("canvas").getContext("2d");
   	ball=new Ball(195,canvasHeight-95,20,5,-5,imgsrc);
	bar=new Bar(210,canvasHeight-20,60,20,skinsrc);
	for(let i =0; i<7; i++){
		stage2_brick[i] =new Block(60 +(blockWidth+blockMargin)*i, 400,blockWidth, blockHeight,2,"image/block/normalBlock/stone/stone");
	}
	stage2_boss[0] = new BossBlock(260,60,80,80,5,"image/boss/head","image/boss/head2");
	stage2_boss[1] = new BossBlock(260,140,80,100,4,"image/boss/body","image/boss/body_red");
	stage2_boss[2] = new BossBlock(230,140,30,110,3,"image/boss/arm1","image/boss/arm1_red");
	stage2_boss[3] = new BossBlock(340,140,30,110,3,"image/boss/arm2","image/boss/arm2_red");
	stage2_boss[4] = new BossBlock(260,220,40,150,3,"image/boss/leg1","image/boss/leg1");
	stage2_boss[5] = new BossBlock(300,220,40,150,3,"image/boss/leg2","image/boss/leg2");
	clear = false;
	crashedBlock = 0;
 }

function initStage3(){
	timerSecond=0;
	timerMemoryWork=false;
	timerMemory=0;
	context=document.getElementById("canvas").getContext("2d");
	ball=new Ball(210,canvasHeight-95,20,5,-5,imgsrc);
	bar=new Bar(190,canvasHeight-20,100,5,skinsrc);

	
	stage3_boss[0] = new BossBlock(300,180,30,180,5,"image/boss2/black/body","image/boss2/red/body");
	stage3_boss[1] = new BossBlock(200,200,250,30,3,"image/boss2/black/bone1","image/boss2/red/bone1");
	stage3_boss[2] = new BossBlock(225,250,200,30,3,"image/boss2/black/bone2","image/boss2/red/bone2");
	stage3_boss[3] = new BossBlock(250,300,150,30,3,"image/boss2/black/bone3","image/boss2/red/bone3");
	stage3_boss[4] = new BossBlock(100,150,400,30,4,"image/boss2/black/neck","image/boss2/red/neck");
	stage3_boss[5] = new BossBlock(100,70,120,120,6,"image/boss2/black/subHead1","image/boss2/red/subHead1");
	stage3_boss[6] = new BossBlock(420,70,120,120,6,"image/boss2/black/subHead2","image/boss2/red/subHead2");
	stage3_boss[7] = new BossBlock(240,60,160,150,7,"image/boss2/black/head","image/boss2/red/head");
	clear = false;
	crashedBlock = 0;
}


/*이미 저장된 정보로 전체 화면을 그리는 함수*/
function drawCanvasStage1(){
	context.clearRect(0,0,canvasWidth,canvasHeight);
	for(var i = 0; i<5;i++){
      for(var j = 0; j<7;j++){
         context.drawImage(stage1_brick[i][j].image,stage1_brick[i][j].position_x,stage1_brick[i][j].position_y);
      }
   	}
   	for(var i = 0;i<stage1_tower.length;i++){
      for(var j =0; j<stage1_tower[i].length;j++){
         context.drawImage(stage1_tower[i][j].image,stage1_tower[i][j].position_x,stage1_tower[i][j].position_y);
      }
    }
  	context.drawImage(ball.image,ball.position_x,ball.position_y, 20,20);
	if(bar.position_x <=600){
		context.drawImage(bar.image,bar.position_x,bar.position_y);
	}
	drawScoreAndLife();
	$("#canvas").mousemove(moveBarByMouse);
	skill_event();
}

function drawCanvasStage2(){
	context.clearRect(0,0,canvasWidth,canvasHeight);
	//만일 한 부위라도 빨갛다면 totalIsRed를 true로 세팅한다.
	var totalIsRed=false;
	for(var i=0;i<stage2_boss.length;i++){
		if(stage2_boss[i].isRed==true){
			totalIsRed=true;
		}
	}
	//만일 머리를 맞았다면 stage2_boss_headHit도 true로 바꾼다
	if(stage2_boss[0].isRed==true) {
		stage2_boss_headHit=true;
	}

	

	//totalIsRed가 true라면 현재 시간을 기록하고 타이머 work를 true로 세팅한다.
	if(totalIsRed==true&&timerMemoryWork==false){
		timerMemoryWork=true;
		timerMemory=timerSecond;
		if(stage2_boss_headHit==true) playEventMusic("music/inGame/death.ogg");
		else playEventMusic("music/inGame/hurt2.ogg");
	}


	//빨갛게 변하는 타이머가 작동중이라면 ->빨갛게 출력하고, 또한 만일 기록의 5초가 지났다면 타이머를 끄고 모든 isRed값을 false로 세팅한다.
	if(timerMemoryWork){
		for(var i =0; i<stage2_boss.length; i++){
			context.drawImage(stage2_boss[i].redImage, stage2_boss[i].position_x,stage2_boss[i].position_y);
		}
		//만일 머리를 맞았다면 머리도 새빨갛게 출력한다.
		if(stage2_boss_headHit==true){
			context.drawImage(stage2_boss[0].criticalImage, stage2_boss[0].position_x,stage2_boss[0].position_y);
		}
		
		if(timerSecond==timerMemory+30){
			timerMemoryWork=false;
			for(var i=0;i<stage2_boss.length;i++){
				stage2_boss[i].isRed=false;
			}
		}
	}
	//빨갛게 변하는 타이머가 작동중이지 않다면-> 원래 모습대로 출력한다.
	else{
		for(var i=0; i<stage2_boss.length; i++){
			context.drawImage(stage2_boss[i].normalImage, stage2_boss[i].position_x,stage2_boss[i].position_y);
		}
	}

	for(var i=0;i<stage2_brick.length;i++){
		context.drawImage(stage2_brick[i].image, stage2_brick[i].position_x,stage2_brick[i].position_y);
	}
   
   	context.drawImage(ball.image,ball.position_x,ball.position_y, 20, 20);
	context.drawImage(bar.image,bar.position_x,bar.position_y, 60, 20);
	drawScoreAndLife();
	$("#canvas").mousemove(moveBarByMouse); 
	skill_event();
}

function drawCanvasStage3(){
	context.clearRect(0,0,canvasWidth,canvasHeight);
	//만일 한 부위라도 빨갛다면 totalIsRed를 true로 세팅한다.
	var totalIsRed=false;
	for(var i=0;i<stage3_boss.length;i++){
		if(stage3_boss[i].isRed==true){
			totalIsRed=true;
		}
	}
	//totalIsRed가 true라면 현재 시간을 기록하고 타이머 work를 true로 세팅한다.
	if(totalIsRed==true&&timerMemoryWork==false){
		timerMemoryWork=true;
		timerMemory=timerSecond;
		var rand_1to4=Math.floor(Math.random() *4)+1;
		playEventMusic("music/inGame/wither_hurt"+rand_1to4+".ogg");
	}


	//빨갛게 변하는 타이머가 작동중이라면 ->빨갛게 출력하고, 또한 만일 기록의 5초가 지났다면 타이머를 끄고 모든 isRed값을 false로 세팅한다.
	if(timerMemoryWork){
		for(var i =0; i<stage3_boss.length; i++){
			context.drawImage(stage3_boss[i].redImage, stage3_boss[i].position_x,stage3_boss[i].position_y);
		}
		if(timerSecond==timerMemory+30){
			timerMemoryWork=false;
			for(var i=0;i<stage3_boss.length;i++){
				stage3_boss[i].isRed=false;
			}
		}
	}
	//빨갛게 변하는 타이머가 작동중이지 않다면-> 원래 모습대로 출력한다.
	else{
		for(var i =0; i<stage3_boss.length; i++){
			context.drawImage(stage3_boss[i].normalImage, stage3_boss[i].position_x,stage3_boss[i].position_y);
		}
	}

	context.drawImage(bar.image,bar.position_x,bar.position_y);
	context.drawImage(ball.image,ball.position_x,ball.position_y,20, 20);
	drawScoreAndLife();
	$("#canvas").mousemove(moveBarByMouse); 
	skill_event();
}

/*객체들의 현재 정보를 매 초 업데이트하고 새로고침한다.*/
function updateAndDrawStage1(){
		totalIsCrashed_vertical=false;
		totalIsCrashed_horizental=false; //충돌 여부 초기화
		ball.checkCrash();
		
		ball.position_x+=ball.delta_x;
		ball.position_y+=ball.delta_y;

		for(var i = 0;i<5;i++){
        	for(var j = 0;j<7;j++){
           		stage1_brick[i][j].checkCrash();
         	}
      	}
      	for(var i = 0;i<stage1_tower.length;i++){
    		for(var j =0; j<stage1_tower[i].length;j++){
         		stage1_tower[i][j].checkCrash();
    		}
 		}
		 
		if(crashedBlock == stage1_block_num){
			playEventMusic("music/levelup.ogg");
			clear = true;
			console.log(clear);
			score = score + life*50;
			alert("Score : "+score);
			var answer = confirm("Go to the next Stage?");
			if(answer){
				button_stop();
				button_start2();
			}else{
				//game over need to code
				// 점수를 출력해주는 함수가 필요하다.
				document.getElementById("canvas").hidden = true;
				document.getElementById("screen_main").style.display = "block";
				timerIsStoped = true;
			}
		}
	drawCanvasStage1();
}


function updateAndDrawStage2(){
	timerSecond++;
	totalIsCrashed_vertical=false;
  	totalIsCrashed_horizental=false; //충돌 여부 초기화
   	ball.position_x+=ball.delta_x;
	ball.position_y+=ball.delta_y;
	stage2_boss_headHit=false;
	var hp = document.getElementById("hp").value;
	ball.checkCrash();
  	for(var i = 0; i<stage2_boss.length; i++){
    	stage2_boss[i].checkCrash();
  	}
  	for(var i=0;i<stage2_brick.length;i++){
		stage2_brick[i].checkCrash();
	}
  	if(hp == 0){
  		playEventMusic("music/levelup.ogg");
		clear = true;
		clearInterval(timer);
		score = score + life*50;
		alert("Score : "+score);
		var answer = confirm("Go to the next Stage?");
		if(answer){
			button_stop();
			button_start3();
			alert("next stage");
		}else{
			document.getElementById("canvas").hidden = true;
			document.getElementById("screen_main").style.display = "block";
			timerIsStoped = true;
		}
	}
	drawCanvasStage2();
}

function updateAndDrawStage3(){
	stage3_boss_hit=false;
	timerSecond++;
	totalIsCrashed_vertical=false;
	totalIsCrashed_horizental=false; //충돌 여부 초기화
	var hp = document.getElementById("hp").value;
	
	ball.position_x+=ball.delta_x;
	ball.position_y+=ball.delta_y;

	ball.checkCrash();
	
	for(var i=0;i<stage3_boss.length;i++){
		stage3_boss[i].checkCrash();
	}
	if(stage3_boss_hit==false){
		moveStage3Boss();
		for(var i=0;i<stage3_boss.length;i++){
			stage3_boss[i].checkCrash();
		}
	} 
	if(stage3_boss_hit==true){
		var rand_0toCanvasWidth = Math.floor(Math.random() * canvasWidth-ball.radius*2-20);
		rand_0toCanvasWidth-=rand_0toCanvasWidth%5;
		ball.position_x=rand_0toCanvasWidth+50;
		ball.position_y=450;
		ball.delta_x=5;
		ball.delta_y=5;
		playEventMusic("music/tpBall.ogg");
	}
		
	if(hp == 0){
		playEventMusic("wither_death.ogg");
		clear = true;
		console.log(clear);
		clearInterval(timer);
		var answer = alert("Stage All Cleared!");
		score = score + life*50;
		alert("Score : "+score);
		
		//if user clear the game go to the main screen no exception
		document.getElementById("canvas").hidden = true;
		document.getElementById("screen_main").style.display = "block";
		timerIsStoped = true;
	}
	drawCanvasStage3();
}

/*점수와 목숨을 출력하는 함수*/
function drawScoreAndLife(){
   context.font = "16px Gothic";
   context.fillStyle = "black";
   context.fillText("Score: "+score,10,20);
   context.font = "16px Arial";
   context.fillStyle = "black";
   context.fillText("Life: "+life,canvasWidth-60,20);

}


//3단계 보스를 매 초마다 움직이는 함수
var mostLeftOfStage3BossIndex=5;
var mostRightOfStage3BossIndex=6;
var deltaOfStage3BossMoving=-1; //보스 움직임의 좌우 (-1이면 왼쪽, 1이면 오른쪽)
function moveStage3Boss(){
	if(stage3_boss[mostLeftOfStage3BossIndex].position_x<=10){
    	deltaOfStage3BossMoving=-deltaOfStage3BossMoving;
    }
   	if(stage3_boss[mostRightOfStage3BossIndex].position_x+stage3_boss[mostRightOfStage3BossIndex].width>=canvasWidth-10){
     	deltaOfStage3BossMoving=-deltaOfStage3BossMoving;
    }
   	for(var i=0;i<stage3_boss.length;i++){
     	stage3_boss[i].position_x+=deltaOfStage3BossMoving*5;
 	}
}

function sound(src){
	this.sound = document.createElement("audio");
	this.sound.src = src;
	// this.sound.type = "audio/ogg";
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
		this.sound.play();
	}
	this.stop = function(){
		this.sound.pause();
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//사용자의 버튼 조작

function startGame1(){
	var a = document.getElementById("canvas");
	a.hidden = false;
	var b = document.getElementById("screen_main");
	b.style.display = "none";
	var c = document.getElementById("control");
	c.style.display = "block";
	button_start1();
}

function startGame2(){
	var a = document.getElementById("canvas");
	a.hidden = false;
	var b =document.getElementById("screen_main");
	b.style.display = "none";
	var c = document.getElementById("control");
	c.style.display = "block";
	button_start2();
}

function startGame3(){
	var a = document.getElementById("canvas");
	a.hidden = false;
	console.log(a.hidden)
	var b =document.getElementById("screen_main");
	console.log(b.style.display);
	b.style.display = "none";
	var c = document.getElementById("control");
	c.style.display = "block";
	button_start3();
}

// 게임이 끝나고 넘어감에 여부 확인 yes -> game2 
// 게임이 끝난거 -> global variables -> crashedBlock++  
// if same as num of blocks -> alert ->
// no -> canvas hidden screen main display none -> block

 

/*사용자가 시작 버튼을 누르면 호출된다.*/

function button_start1(){
	playEventMusic("music/click.ogg");
	playEventMusic
	skill_num = 2;
	score = 0;
	life = 5;
	initStage1();
	drawCanvasStage1();
	if(timerIsStoped==true){
		timer=setInterval(updateAndDrawStage1,frameMS);
		timerIsStoped=false;
	}else{
		
	}

}

function button_start2(){
	playEventMusic("music/click.ogg");
	score = 0;
	life = 5;
	skill_num =2;
	var hp = document.getElementById("hp");
   	hp.style.display = "block";
   	hp.max = stage2_boss_hp;
   	hp.value = stage2_boss_hp;
	initStage2();
	drawCanvasStage2();
	if(timerIsStoped==true){
		timer=setInterval(updateAndDrawStage2,frameMS);
		timerIsStoped=false;
	}else{
		
	}
}

function button_start3(){
	playEventMusic("music/click.ogg");
	score = 0;
	life = 5;
	skill_num =2;
	var hp = document.getElementById("hp");
   	hp.style.display = "block";
   	hp.max = stage3_boss_hp;
   	hp.value = stage3_boss_hp;
	initStage3();
	drawCanvasStage3();
	if(timerIsStoped==true){
		timer=setInterval(updateAndDrawStage3,frameMS);
		timerIsStoped=false;
	}else{
		
	}
}

//when user click the 'go to setting' button -> exec
function getSettingScreen(){
	playEventMusic("music/click.ogg");
	//todo: main screen -> setting screen

	//main screen display : none
	var a=document.getElementById("screen_main");
	a.style.display = "none";
	//setting screen display : block
	var b=document.getElementById("setting_screen");
	b.style.display = "block";
	var c=document.getElementById("content");
	c.style.display = "none";
}

//when user click 'go to main' button ->  exec
function getMainScreen(){
	// 게임 도중 quit => 종료 여부 묻기
	var answer = confirm("Quit Game?");
	if(answer){
		var a=document.getElementById("setting_screen");
		a.style.display = "none";
		var b=document.getElementById("screen_main");
		b.style.display = "block";
		var c=document.getElementById("content");
		c.style.display = "block";
		var d=document.getElementById("canvas");
		button_stop();
		d.hidden = true;
		var hp = document.getElementById("hp");
        hp.style.display = "none";
		var c = document.getElementById("control");
		c.style.display = "none";
	}else{
		alert("Game Continue");
	}
}
function getMainScreen2(){

	alert("ball: "+ weaponStr + "\n" + "bar: " + skinStr);
	var a=document.getElementById("setting_screen");
	a.style.display = "none";
	var b=document.getElementById("screen_main");
	b.style.display = "block";
	var c=document.getElementById("content");
	c.style.display = "block";
	var d=document.getElementById("canvas");
	button_stop();
	d.hidden = true;
}

/*사용자가 정지 버튼을 누르면 호출된다.*/
function button_stop(){
	clearInterval(timer);
	timerIsStoped=true;
}

/*사용자가 플레이 버튼을 누르면 호출된다.*/ //stop과 대응되는 버튼
function button_play(){
	if(timerIsStoped==true){
		timer=setInterval(updateAndDraw,frameMS);
		timerIsStoped=false;
	}else{
		
	}
}


function skill_event(){
	document.addEventListener('keydown',function(e){
		const keyCode = e.keyCode;
		if(keyCode ==32){
			button_skillReady();
		}
	})
	document.addEventListener('keyup',function(e){
		const keyCode = e.keyCode;
		if(keyCode ==32){
			button_skillUse();
		}
	})
}

/*사용자가 skill 준비 버튼을 누르면 호출된다.*/
function button_skillReady(){
	if(ball.skillReady==false&&skill_num>0){
		ball.skillReady=true;
		playEventMusic("music/inGame/drip1.ogg");
	}
}

/*사용자가 skill 사용 버튼을 누르면 호출된다.*/
function button_skillUse(){
	if(ball.skillReady==true&&skill_num>0&&ball.isAttached==true){
		ball.delta_x=ball.temp_delta_x;
		ball.delta_y=ball.temp_delta_y;
		ball.delta_y=-ball.delta_y;
		ball.isAttached=false;
		ball.skillReady=false;
		skill_num--;
		playEventMusic("music/inGame/weak4.ogg");
	}

}


//////////////////////////////////////////////////////////////////////////////////////////////////
//이벤트 함수 

var moveBarByMouse=function (e) {
	var relative_x=e.pageX-canvas.offsetLeft;
	var relative_y=e.pageY-canvas.offsetTop;
	if(relative_x>=bar.width/2&&relative_x<=canvasWidth-bar.width/2){
		bar.position_x=relative_x-bar.width/2;
		if(ball.isAttached==true){
			ball.position_x=relative_x-relative_x%5;
		}
	}
}

var playBackgroundMusic=function(presentMusicSrc){
	if(backgroundMusic){
		backgroundMusic.stop();
	}
	backgroundMusic = new sound(presentMusicSrc);
	backgroundMusic.play();
}

var playEventMusic=function(presentMusicSrc){
	var eventMusic = new sound(presentMusicSrc);
	eventMusic.play();
}

//setting
//전체 음소거 해지
function fun0(){
	for (let i = 1; i< 5; i++){
		document.getElementById(i.toString()).muted = false;
	}	
}
//전체 음소거
function fun1(){
	for (let i = 1; i< 5; i++){
		document.getElementById(i.toString()).muted = true;
	}	
}

//setting display -> img select -> game 유지 game init -> new Ball
//global var = > img path src -> init -> new ball(x,y,r,imgsrc)

function ip(){
	imgsrc = "image/ball/ironpickaxe.png";
	weaponStr = "ironpickaxe";
	playEventMusic("music/click.ogg");
}	
function gp(){
	imgsrc = "image/ball/goldpickaxe.png";
	weaponStr = "goldpickaxe";
	playEventMusic("music/click.ogg");
} 
function dp(){
	imgsrc = "image/ball/diapickaxe.png";
	weaponStr = "diapickaxe";
	playEventMusic("music/click.ogg");
}
function ia(){
	imgsrc = "image/ball/ironaxe.png";	
	weaponStr = "ironaxe";
	playEventMusic("music/click.ogg");
} 
function ga(){	
	imgsrc = "image/ball/goldaxe.png";
	weaponStr = "goldaxe";
	playEventMusic("music/click.ogg");
} 
function da(){	
	imgsrc = "image/ball/diaaxe.png";
	weaponStr = "diaaxe";
	playEventMusic("music/click.ogg");
}
function s1(){
	skinsrc = "image/bar/skin1.jpg";
	skinStr ="skin1";
	playEventMusic("music/click.ogg");
} 
function s2(){
	skinsrc = "image/bar/skin2.jpg";
	skinStr ="skin2";
	playEventMusic("music/click.ogg");
} 
function s3(){
	skinsrc = "image/bar/skin3.jpg";
	skinStr = "skin3";
	playEventMusic("music/click.ogg");
} 
function s4(){
	skinsrc = "image/bar/skin4.jpg";
	skinStr = "skin4";
	playEventMusic("music/click.ogg");
} 
function s5(){
	skinsrc = "image/bar/skin5.jpg";
	skinStr = "skin5";
	playEventMusic("music/click.ogg");
}
