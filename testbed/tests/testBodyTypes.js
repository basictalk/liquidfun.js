function TestBodyTypes() {
  //setup ground
  var bd = new b2BodyDef();
  var ground = world.CreateBody(bd);

  var edge = new b2EdgeShape();
  edge.Set(new b2Vec2(-20, 0), new b2Vec2(20, 0));

  var fd = new b2FixtureDef();
  fd.shape = edge;
  ground.CreateFixtureFromDef(fd);

  //setup attachment
  bd = new b2BodyDef();
  bd.type = b2_dynamicBody;
  bd.position.Set(0, 3);
  var attachment = world.CreateBody(bd);

  var box = new b2PolygonShape();
  box.SetAsBoxXY(0.5, 2);
  attachment.CreateFixtureFromShape(box, 2);

  // setup platform
  bd = new b2BodyDef();
  bd.type = b2_dynamicBody;
  bd.position.Set(-4, 5);
  var platform = world.CreateBody(bd);

  box = new b2PolygonShape();
  box.SetAsBoxXYCenterAngle(0.5, 4, new b2Vec2(4, 0), 0.5 * Math.PI);

  fd = new b2FixtureDef();
  fd.shape = box;
  fd.friction = 0.6;
  fd.density = 2;
  platform.CreateFixtureFromDef(fd);

  // TODO finish this test
}