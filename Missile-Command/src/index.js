import 'phaser';
import pkg from 'phaser/package.json';

var config = {
    type: Phaser.AUTO,
    width: 256,
    height: 231,
    pixelArt: true,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
          player: null,
          reticle: null,
          shoot: shoot
        }
    }
};

const game = new Phaser.Game(config);
var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:
    // Bullet Constructor
    function Bullet (scene)
    {
        scene.sound.play('launch');
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'missile');
        this.speed = .3;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.setSize(12, 12, true);
        this.trail = new Phaser.Geom.Line(this.x, this.y,this.x,this.y);
    },

    // Fires a bullet from the player to the reticle
    fire: function (shooter, target, scene)
    {
      var ammos = ammo.getChildren();
      var usingammo
      if(ammos.length != 0){
        //which ammo to use
        if(game.input.mousePointer.x < 85){
          usingammo =0;}
        else if (game.input.mousePointer.x < 171) {
            if(ammos.length % 2 == 0){
              usingammo =ammos.length / 2;
            }
            else{
              usingammo =(ammos.length / 2)+.5;
            }
        }
        else{
          usingammo =ammos.length-1;
        }
        this.setPosition(ammos[usingammo].x,ammos[usingammo].y);
        //this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (game.input.mousePointer.x-this.x) / (game.input.mousePointer.y-this.y));
        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (game.input.mousePointer.y >= this.y){
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else{
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }
        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
        this.targetX = game.input.mousePointer.x;
        this.targetY = game.input.mousePointer.y;
        this.trail = new Phaser.Geom.Line(ammos[usingammo].x,ammos[usingammo].y,this.x,this.y);
        ammos[usingammo].destroy();
      }
    },
    // Updates the position of the bullet each cycle
    update: function (time, delta)
    {
      //trail
      this.trail.x2 = this.x;
      this.trail.y2 = this.y;
      missilefx.strokeLineShape(this.trail);

        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 10000)
        {
            this.setActive(false);
            this.setVisible(false);
        }
        if (this.y <= this.targetY){
            var expl = explosions.get().setActive(true).setVisible(true);
            expl.x = this.x;
            expl.y = this.y;
            missilefx.clear(this.trail);
            this.destroy();
        }
    }
});

var Explosion = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize:
  // Bullet Constructor
  function Explosion (scene)
  {
    scene.sound.play('bang');
    this.size = .01;
      Phaser.GameObjects.Image.call(this, scene, 0, 0, 'explosion');
      this.grow = true;
      this.setSize(12, 12, true);
  },

  update: function (time, delta)
  { this.scaleX = this.size;
    this.scaleY = this.size;
    if(this.grow == true){ this.size += .008;}
    else{ this.size -= .008; }
    if (this.size > .45){ this.grow = false; }
    if (this.size <= 0 ){ this.destroy(); }
  }
});

var Meteor = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
  // Meteor Constructor
  function Meteor(scene)
  {
    if(cities.getChildren().length > 0){
      var targetCity;
      this.startx = Phaser.Math.Between(0, 256);
      var citychildren = cities.getChildren();
      var basechildren = bases.getChildren();
      var randtarget = Phaser.Math.Between(0, (citychildren.length-1) + (basechildren.length-1))
      if (randtarget < basechildren.length){
        targetCity = basechildren[Phaser.Math.Between(0, basechildren.length-1)];
      }
      else{
        targetCity = citychildren[Phaser.Math.Between(0, citychildren.length-1)];
      }

      Phaser.GameObjects.Image.call(this, scene, this.startx, 0, 'meteor');
      this.speed = .02;
      this.direction = Math.atan((targetCity.x-this.x) / (208-this.y));
      //var smoke = trailgroup.get();

      // Calculate X and y velocity of bullet to moves it from shooter to target
      if (350 >= this.y){
          this.xSpeed = this.speed*Math.sin(this.direction);
          this.ySpeed = this.speed*Math.cos(this.direction);
      }
      else{
          this.xSpeed = -this.speed*Math.sin(this.direction);
          this.ySpeed = -this.speed*Math.cos(this.direction);
      }
  }//trailgroup = scene.add.group(config);
  this.smoke = new Phaser.Geom.Line(this.startx, 0,this.x,this.y);
  //graphics.strokeLineShape(this.smoke);
  },

  update: function (time, delta)
  {
    this.smoke.x2 = this.x;
    this.smoke.y2 = this.y;
    //graphics.clear(this.smoke);
    graphics.strokeLineShape(this.smoke);
    this.x += this.xSpeed * delta;
    this.y += this.ySpeed * delta;

    if(this.y > config.height){
      graphics.clear(this.trail);
      this.destroy();
    }
  }
});
function preload ()
{
    this.load.image('ground', 'src/img/ground.png');
    this.load.image('meteor', 'src/img/meteor.png');
    this.load.image('trail', 'src/img/meteor.png');
    this.load.image('missile', 'src/img/missile.png');
    this.load.image('explosion', 'src/img/explosion.png');
    this.load.image('city', 'src/img/city.png');
    this.load.image('base1', 'src/img/base1.png');
    this.load.image('base2', 'src/img/base2.png');
    this.load.image('base3', 'src/img/base3.png');
    this.load.image('ammo', 'src/img/ammo.png');
    this.load.audio('bang', 'src/sound/expl.wav');
    this.load.audio('launch', 'src/sound/missile_launch.wav');
}
var count;
var meteor;
var missile;
var bullets;
var lastfired;
var text;
var shoot;
var reticle;
var explosions;
var meteors;
var graphics;
var line;
var missilefx;
var cities;
var bases;
var ammo;
var count;
var points;
function create (scene)
{
  points = 0;
  //groups
  var playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
  explosions = this.physics.add.group({ classType: Explosion, runChildUpdate: true });
  meteors = this.physics.add.group({ classType: Meteor, runChildUpdate: true });
  cities = this.physics.add.group();
  bases = this.physics.add.group();
  ammo = this.add.group();

  //placing ground
  var ground = this.physics.add.image(128, 221, 'ground');



  //placing bases
  bases.create(21, 208, 'base1');
  bases.create(124, 208, 'base2');
  bases.create(242, 208, 'base3');

  //ammo
  ammo.create(21, 208, 'ammo');ammo.create(18, 210, 'ammo');ammo.create(24, 210, 'ammo');ammo.create(21, 212, 'ammo');ammo.create(27, 212, 'ammo');ammo.create(15, 212, 'ammo');ammo.create(12, 214, 'ammo');ammo.create(18, 214, 'ammo');ammo.create(24, 214, 'ammo');ammo.create(30, 214, 'ammo');
  ammo.create(124, 208, 'ammo');ammo.create(121, 210, 'ammo');ammo.create(127, 210, 'ammo');ammo.create(124, 212, 'ammo');ammo.create(130, 212, 'ammo');ammo.create(118, 212, 'ammo');ammo.create(115, 214, 'ammo');ammo.create(121, 214, 'ammo');ammo.create(127, 214, 'ammo');ammo.create(133, 214, 'ammo');
  ammo.create(242, 208, 'ammo');ammo.create(239, 210, 'ammo');ammo.create(245, 210, 'ammo');ammo.create(242, 212, 'ammo');ammo.create(248, 212, 'ammo');ammo.create(236, 212, 'ammo');ammo.create(233, 214, 'ammo');ammo.create(239, 214, 'ammo');ammo.create(245, 214, 'ammo');ammo.create(251, 214, 'ammo');
  //placing cities
  cities.create(44, 212, 'city');
  cities.create(70, 213, 'city');
  cities.create(94, 214, 'city');
  cities.create(148, 212, 'city');
  cities.create(180, 209, 'city');
  cities.create(208, 213, 'city');


    graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xff0000 } });
    missilefx = this.add.graphics({ lineStyle: { width: 1, color: 0x0000ff } });


    lastfired = 0;
    missile = this.physics.add.image(300, 0, 'missile');

    //meteor = this.physics.add.image(50, 1, 'meteor');

    text = this.add.text(128, 2, '', { font: '12px Courier', fill: '#ff0000' });

    reticle = this.physics.add.sprite(800, 700, 'missile');

    this.physics.add.overlap(explosions, meteors, killMeteor, null, this);
    function killMeteor (explosion, meteor)
    {
      var expl = explosions.get().setActive(true).setVisible(true);
      expl.x = meteor.x;
      expl.y = meteor.y;
      //this.eraser = new Phaser.Geom.Line(meteor.x, meteor.y, meteor.startx, 0);
      //erasergfx.strokeLineShape(this.eraser);
      graphics.clear(meteor.smoke)
        meteor.destroy();
        points += 10;
    }

    this.physics.add.overlap(cities, meteors, destroyCity, null, this);
    function destroyCity (cities, meteor)
    {
      var expl = explosions.get().setActive(true).setVisible(true);
      expl.x = meteor.x;
      expl.y = meteor.y;
      graphics.clear(meteor.smoke);
        meteor.destroy();
        cities.destroy();
    }

    this.physics.add.overlap(bases, meteors, destroyBase, null, this);
    function destroyBase (bases, meteor)
    {
      var a = ammo.getChildren()
      var b = a.length;
      graphics.clear(meteor.smoke);
      if (bases.x<config.width/3){
        for (var i = 0; i < a.length; i++){
          if(a[i].x <config.width/3 ){
            a[i].destroy();
            i -=1;
          }
        }
      }
      else if (bases.x<config.width*.66){
        for (var i = 0; i < a.length; i++){
          if(a[i].x <config.width *.66 &&  a[i].x >config.width/3){
            a[i].destroy();
            i -=1;
          }
        }
      }
      else{
        for (var i = 0; i < a.length; i++){
          if(a[i].x >config.width *.66){
            a[i].destroy();
            i -=1;
          }
        }
      }
      var expl = explosions.get().setActive(true).setVisible(true);
      expl.x = meteor.x;
      expl.y = meteor.y;
        meteor.destroy();
        bases.destroy();
    }

      this.input.on('pointermove', function (pointer) {
              if (this.input.mouse.locked)
              {
                  reticle.x += pointer.movementX;
                  reticle.y += pointer.movementY;
              }
      }, this);

      this.input.on('pointerdown', function (pointer, time, lastfired) {
             if (ammo.getChildren().length > 0){
                var bullet = playerBullets.get().setActive(true).setVisible(true);
                bullet.fire(ground, reticle);
             }
      }, this);
      //first wave of meteors
      count = Phaser.Math.Between(4, 6);
      for(var i = 0; i < count; i++){
        var firstmet = meteors.get().setActive(true).setVisible(true);
      }
}


function update (time){
var lives = cities.getChildren().length
    //game-over
    if(lives == 0){
      this.scene.pause();
      let gameOverText = this.add.text(45, (game.config.height / 2) - 30, 'GAME OVER', { fontSize: '32px', fill: '#fff' });
      gameOverText.setDepth(1);
      this.scene.pause();

    }
    text.setText([
        points,
      ]);
  // check for active input
  // check for active input
   if (this.input.activePointer.isDown && time > lastfired) {
  lastfired = time + 400;
    //var hah = meteors.get().setActive(true).setVisible(true);
   }

   //continuos meteors
   if(Phaser.Math.Between(0, 60) == 30){
      var firstmet = meteors.get().setActive(true).setVisible(true);
      count ++;
   }
//this.add.image(meteor.x, meteor.y, 'trail');


}
