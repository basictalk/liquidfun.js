#include <Box2D/Box2D.h>
// b2BodyDef functions
void* b2BodyDef_Create() {
  return new b2BodyDef();
}

void b2BodyDef_Delete(void* def) {
  delete (b2BodyDef*)def;
}

void b2BodyDef_SetBullet(void* def, float bullet) {
  ((b2BodyDef*)def)->bullet = (bool)bullet;
}

void b2BodyDef_SetPosition(void* def, float x, float y) {
  ((b2BodyDef*)def)->position.Set(x, y);
}

void b2BodyDef_SetType(void* def, float type) {
  ((b2BodyDef*)def)->type = (b2BodyType)type;
}

// b2Body functions
void* b2Body_CreateFixture_b2BodyDef(void* body, void* def) {
  return ((b2Body*)body)->CreateFixture((b2FixtureDef*)def);
}

// create fixture from circle
void* b2Body_CreateFixture_b2CircleShape(void* body,
                                         // Fixturedef
                                         double density, double friction,
                                         double isSensor, double restitution,
                                         double userData,
                                         // circle
                                         double px, double py,
                                         double radius) {
  b2FixtureDef def;
  def.density = density;
  def.friction = friction;
  def.isSensor = isSensor;
  def.restitution = restitution;
  def.userData = (void*)&userData;

  b2CircleShape circle;
  circle.m_p.Set(px, py);
  circle.m_radius = radius;

  def.shape = &circle;
  return ((b2Body*)body)->CreateFixture(&def);
}


// b2Body create fixture from edge shape
void* b2Body_CreateFixture_b2EdgeShape(void* body,
                                         // Fixturedef
                                         double density, double friction,
                                         double isSensor, double restitution,
                                         double userData,
                                         // circle
                                         double x0, double y0,
                                         double x1, double y1) {
  b2FixtureDef def;
  def.density = density;
  def.friction = friction;
  def.isSensor = isSensor;
  def.restitution = restitution;
  def.userData = (void*)&userData;

  b2Vec2 v0(x0, y0);
  b2Vec2 v1(x1, y1);

  b2EdgeShape edge;
  edge.Set(v0, v1);

  def.shape = &edge;
  return ((b2Body*)body)->CreateFixture(&def);
}

// b2Body createFixture from polygon shape and def
void* b2Body_CreateFixture_b2PolygonShape_3(void* body,
                                            // Fixturedef
                                            double density, double friction,
                                            double isSensor, double restitution,
                                            double userData,
                                            // shape
                                            double x0, double y0,
                                            double x1, double y1,
                                            double x2, double y2) {
  b2FixtureDef def;
  def.density = density;
  def.friction = friction;
  def.isSensor = isSensor;
  def.restitution = restitution;
  def.userData = (void*)&userData;

  const int count = 3;
  b2Vec2 points[count] = {
      b2Vec2(x0, y0),
      b2Vec2(x1, y1),
      b2Vec2(x2, y2)
  };

  b2PolygonShape polygon;
  polygon.Set(points, count);

  def.shape = &polygon;
  return ((b2Body*)body)->CreateFixture(&def);
}

void* b2Body_CreateFixture_b2PolygonShape_4(void* body,
                                            // Fixturedef
                                            double density, double friction,
                                            double isSensor, double restitution,
                                            double userData,
                                            // shape
                                            double x0, double y0,
                                            double x1, double y1,
                                            double x2, double y2,
                                            double x3, double y3) {
  b2FixtureDef def;
  def.density = density;
  def.friction = friction;
  def.isSensor = isSensor;
  def.restitution = restitution;
  def.userData = (void*)&userData;

  const int count = 4;
  b2Vec2 points[count] = {
      b2Vec2(x0, y0),
      b2Vec2(x1, y1),
      b2Vec2(x2, y2),
      b2Vec2(x3, y3)
  };

  b2PolygonShape polygon;
  polygon.Set(points, count);

  def.shape = &polygon;
  return ((b2Body*)body)->CreateFixture(&def);
}



void* b2Body_CreateFixture_b2Shape(void* body, void* shape, float density) {
  return ((b2Body*)body)->CreateFixture((b2Shape*)shape, density);
}

float b2Body_GetAngle(void* body) {
  return ((b2Body*)body)->GetAngle();
}

void* b2Body_GetFixtureList(void* body) {
  return ((b2Body*)body)->GetFixtureList();
}

void* b2Body_GetNext(void* body) {
  return ((b2Body*)body)->GetNext();
}

void* b2Body_GetPosition(void* body) {
  return const_cast<b2Vec2*>(&((b2Body*)body)->GetPosition());
}

void b2Body_GetTransformTest(void* body, float* arr) {
  b2Transform* t = const_cast<b2Transform*>(&((b2Body*)body)->GetTransform());

  arr[0] = (double)t->p.x;
  arr[1] = (double)t->p.y;
  arr[2] = (double)t->q.s;
  arr[3] = (double)t->q.c;
}

void* b2Body_GetTransform(void* body) {
  return const_cast<b2Transform*>(&((b2Body*)body)->GetTransform());
}

void b2Body_SetLinearVelocity(void* body, double x, double y) {
  ((b2Body*)body)->SetLinearVelocity(b2Vec2(x, y));
}
