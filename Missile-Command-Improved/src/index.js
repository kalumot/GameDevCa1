import 'phaser';
import pkg from 'phaser/package.json';

var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 1000,
    //pixelArt: true,
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
        this.speed = 1;
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
        if(game.input.mousePointer.x < config.width/3){
          usingammo =0;}
        else if (game.input.mousePointer.x < config.width * .66) {
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
        //this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
        this.targetX = game.input.mousePointer.x;
        this.targetY = game.input.mousePointer.y;
        this.trail = new Phaser.Geom.Line(ammos[usingammo].x,ammos[usingammo].y,this.x,this.y);
        this.rotation = Phaser.Math.Angle.Between(this.x, this.y, this.targetX , this.targetY) + 1.5;
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
    this.size = .035;
      Phaser.GameObjects.Image.call(this, scene, 0, 0, 'explosion');
      this.grow = true;
      this.setSize(12, 12, true);
  },

  update: function (time, delta)
  { this.scaleX = this.size;
    this.scaleY = this.size;
    if(this.grow == true){ this.size += .028;}
    else{ this.size -= .028; }
    if (this.size > 1.6){ this.grow = false; }
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
      this.startx = Phaser.Math.Between(0, config.width);
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
      this.rotation = Phaser.Math.Angle.Between(this.x, this.y, targetCity.x, targetCity.y)+ 1.5;
      this.speed = .07;
      this.direction = Math.atan((targetCity.x-this.x) / (940-this.y));
      //var smoke = trailgroup.get();

      // Calculate X and y velocity of bullet to moves it from shooter to target
      if (500 >= this.y){
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

var AmmoMissile = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
  // Meteor Constructor
  function AmmoMissile(scene)
  {
    if(cities.getChildren().length > 0){
      var targetCity;
      this.startx = Phaser.Math.Between(0, config.width);
      var citychildren = cities.getChildren();
      var basechildren = bases.getChildren();
      var randtarget = Phaser.Math.Between(0, (citychildren.length-1) + (basechildren.length-1))
      if (randtarget < basechildren.length){
        targetCity = basechildren[Phaser.Math.Between(0, basechildren.length-1)];
      }
      else{
        targetCity = citychildren[Phaser.Math.Between(0, citychildren.length-1)];
      }

      Phaser.GameObjects.Image.call(this, scene, this.startx, 0, 'ammomissile');
      this.rotation = Phaser.Math.Angle.Between(this.x, this.y, targetCity.x, targetCity.y)+ 1.5;
      this.speed = .1;
      this.direction = Math.atan((targetCity.x-this.x) / (940-this.y));
      //var smoke = trailgroup.get();

      // Calculate X and y velocity of bullet to moves it from shooter to target
      if (500 >= this.y){
          this.xSpeed = this.speed*Math.sin(this.direction);
          this.ySpeed = this.speed*Math.cos(this.direction);
      }
      else{
          this.xSpeed = -this.speed*Math.sin(this.direction);
          this.ySpeed = -this.speed*Math.cos(this.direction);
      }
  }//trailgroup = scene.add.group(config);
  this.smoke = new Phaser.Geom.Line(this.startx, 0,this.x,this.y);
  },

  update: function (time, delta)
  {
    this.smoke.x2 = this.x;
    this.smoke.y2 = this.y;
    //graphics.clear(this.smoke);
    ammogfx.strokeLineShape(this.smoke);
    this.x += this.xSpeed * delta;
    this.y += this.ySpeed * delta;

    if(this.y > config.height){
      ammogfx.clear(this.trail);
      this.destroy();
    }
  }
});
function preload ()
{
    this.load.image('ground', 'src/img/water.png');
    this.load.image('meteor', 'src/img/missile_medium.png');
    this.load.image('trail', 'src/img/meteor.png');
    this.load.image('missile', 'src/img/anti_missile.png');
    this.load.image('explosion', 'src/img/explosion.png');
    this.load.image('city', 'src/img/city01.png');
    this.load.image('base', 'src/img/base.png');
    this.load.image('sky', 'src/img/sky.png');
    this.load.image('ammo', 'src/img/ammo.png');
    this.load.image('ammomissile', 'src/img/anti_missile.png');
    this.load.audio('bang', 'src/sound/expl.wav');
    this.load.audio('launch', 'src/sound/missile_launch.wav');
    this.load.audio('music', 'src/sound/Defense Line.mp3');
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
var ammomissiles;
var bases;
var ammo;
var count;
var points;
var ammotext;
var ammogfx;
function create (scene)
{
  var music = this.sound.add('music');
  music.volume = .5;
  music.play();
  var sky = this.physics.add.image(config.width/2, config.height/2, 'sky');
  points = 0;
  //groups
  var playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
  explosions = this.physics.add.group({ classType: Explosion, runChildUpdate: true });
  meteors = this.physics.add.group({ classType: Meteor, runChildUpdate: true });
  ammomissiles = this.physics.add.group({ classType: AmmoMissile, runChildUpdate: true });
  cities = this.physics.add.group();
  bases = this.physics.add.group();
  ammo = this.add.group();
  //placing ground
  var ground = this.physics.add.image(config.width/2, config.height, 'ground');

  //placing bases
  bases.create(50, 930, 'base');
  bases.create(500, 930, 'base');
  bases.create(950, 930, 'base');

  //ammo
  ammo.create(50, 905, 'ammo');ammo.create(47, 908, 'ammo');ammo.create(53, 908, 'ammo');ammo.create(50, 911, 'ammo');ammo.create(44, 911, 'ammo');ammo.create(56, 911, 'ammo');ammo.create(41, 914, 'ammo');ammo.create(47, 914, 'ammo');ammo.create(53, 914, 'ammo');ammo.create(59, 914, 'ammo');
  ammo.create(500, 905, 'ammo');ammo.create(497, 908, 'ammo');ammo.create(503, 908, 'ammo');ammo.create(500, 911, 'ammo');ammo.create(494, 911, 'ammo');ammo.create(506, 911, 'ammo');ammo.create(491, 914, 'ammo');ammo.create(497, 914, 'ammo');ammo.create(503, 914, 'ammo');ammo.create(509, 914, 'ammo');
  ammo.create(950, 905, 'ammo');ammo.create(947, 908, 'ammo');ammo.create(953, 908, 'ammo');ammo.create(950, 911, 'ammo');ammo.create(944, 911, 'ammo');ammo.create(956, 911, 'ammo');ammo.create(941, 914, 'ammo');ammo.create(947, 914, 'ammo');ammo.create(953, 914, 'ammo');ammo.create(959, 914, 'ammo');
  //placing cities
  //cities.size = .05
  cities.create(160, 940, 'city');
  cities.create(270, 940, 'city');
  cities.create(380, 940, 'city');
  cities.create(620, 940, 'city');
  cities.create(730, 940, 'city');
  cities.create(840, 940, 'city');

    graphics = this.add.graphics({ lineStyle: { width: 5, color: 0xff0000 } });
    missilefx = this.add.graphics({ lineStyle: { width: 5, color: 0x0000ff } });
    ammogfx = this.add.graphics({ lineStyle: { width: 5, color: 0x00ff00 } });
    lastfired = 0;
    text = this.add.text(10, 5, '', { font: '48px Courier', fill: '#ffffff' });
    ammotext = this.add.text(800, 5, '', { font: '36px Courier', fill: '#ffffff' });
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
    this.physics.add.overlap(explosions, ammomissiles, killAmmoMissile, null, this);
    function killAmmoMissile (explosion, ammomissile)
    {
      var b = bases.getChildren();
      var a = ammo.getChildren();
      var expl = explosions.get().setActive(true).setVisible(true);
      expl.x = ammomissile.x;
      expl.y = ammomissile.y;
      for (var i = 0; i < a.length; i++){
            a[i].destroy();
            i-=1;
      }
      for (var i = 0; i < b.length; i++){
            b[i].destroy();
            i-=1;
      }
      bases.create(50, 930, 'base');
      bases.create(500, 930, 'base');
      bases.create(950, 930, 'base');
        ammo.create(50, 905, 'ammo');ammo.create(47, 908, 'ammo');ammo.create(53, 908, 'ammo');ammo.create(50, 911, 'ammo');ammo.create(44, 911, 'ammo');ammo.create(56, 911, 'ammo');ammo.create(41, 914, 'ammo');ammo.create(47, 914, 'ammo');ammo.create(53, 914, 'ammo');ammo.create(59, 914, 'ammo');
        ammo.create(500, 905, 'ammo');ammo.create(497, 908, 'ammo');ammo.create(503, 908, 'ammo');ammo.create(500, 911, 'ammo');ammo.create(494, 911, 'ammo');ammo.create(506, 911, 'ammo');ammo.create(491, 914, 'ammo');ammo.create(497, 914, 'ammo');ammo.create(503, 914, 'ammo');ammo.create(509, 914, 'ammo');
        ammo.create(950, 905, 'ammo');ammo.create(947, 908, 'ammo');ammo.create(953, 908, 'ammo');ammo.create(950, 911, 'ammo');ammo.create(944, 911, 'ammo');ammo.create(956, 911, 'ammo');ammo.create(941, 914, 'ammo');ammo.create(947, 914, 'ammo');ammo.create(953, 914, 'ammo');ammo.create(959, 914, 'ammo');

      ammogfx.clear(ammomissile.smoke)
        ammomissile.destroy();
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
        this.cameras.main.shake(60);
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
        this.cameras.main.shake(60);
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
      //count = Phaser.Math.Between(4, 6);
      //for(var i = 0; i < count; i++){
      //  var firstmet = meteors.get().setActive(true).setVisible(true);
      //}
      var testammo = ammomissiles.get().setActive(true).setVisible(true);
}


function update (time){
var lives = cities.getChildren().length
    //game-over
    if(lives == 0){
      this.scene.pause();
      let gameOverText = this.add.text(230, (game.config.height / 2) -100, 'GAME OVER', { fontSize: '100px', fill: '#fff' });
      gameOverText.setDepth(1);
      this.scene.pause();

    }
    text.setText([
        points,

      ]);
    ammotext.setText([
          "AMMO: " + ammo.getChildren().length,

      ]);
  // check for active input
  // check for active input
   if (this.input.activePointer.isDown && time > lastfired) {
  lastfired = time + 400;
    //var hah = meteors.get().setActive(true).setVisible(true);
   }

   //continuos meteors
   var rngAmmo = Phaser.Math.Between(0, 1200)
   var rng = Phaser.Math.Between(0, 70)
   if(rng == 30){
      var firstmet = meteors.get().setActive(true).setVisible(true);
      count ++;
   }
   if(rngAmmo == 50){
     var am = ammomissiles.get().setActive(true).setVisible(true);
   }
//this.add.image(meteor.x, meteor.y, 'trail');


}
