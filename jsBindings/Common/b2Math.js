function b2Vec2(x, y) {
  if (x === undefined) {
    x = 0;
  }
  if (y === undefined) {
    y = 0;
  }
  this.x = x;
  this.y = y;
}

b2Vec2.prototype.Set = function(x, y) {
  this.x = x;
  this.y = y;
}

b2Vec2.Mul = function(out, T, v) {
  var Tp = T.p;
  var Tqc = T.q.c;
  var Tqs = T.q.s;
  
  var x = v.x;
  var y = v.y;

  out.x = (Tqc * x - Tqs * y) + Tp.x;
  out.y = (Tqs * x + Tqc * y) + Tp.y;
}

b2Vec2.Add = function(out, a, b) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
}

function b2Rot(radians) {
  if (radians === undefined) {
    radians = 0;
  }
  this.s = Math.sin(radians);
  this.c = Math.cos(radians);
}

function b2Transform(position, rotation) {
  if (position === undefined) {
    position = new b2Vec2();
  }
  if (rotation === undefined) {
    rotation = new b2Rot();
  }
  this.p = position;
  this.q = rotation;
}

b2Transform.prototype.FromFloat64Array = function(arr) {
  var p = this.p;
  var q = this.q;
  p.x = arr[0];
  p.y = arr[1];
  q.s = arr[2];
  q.c = arr[3];
// console.log(p.x + " " + p.y + " " + q.s + " " + q.c);
}