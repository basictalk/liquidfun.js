function TestRope() {
  var N = 40;
  var def = new b2RopeDef;

  for (var i = 0; i < N; ++i) {
    def.vertices.push(new b2Vec2(0.0, 20.0 - 0.25 * i));
    def.masses.push(1.0);
  }
  def.masses[0] = 0.0;
  def.masses[1] = 0.0;

  def.count = N;
  def.gravity.Set(0.0, -10.0);
  def.damping = 0.1;
  def.k2 = 1.0;
  def.k3 = 0.5;

  this.rope.Initialize(def);

  this.angle = 0.0;
  this.rope.SetAngle(this.angle);
}