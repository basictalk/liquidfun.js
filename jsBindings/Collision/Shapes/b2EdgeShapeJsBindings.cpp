#include <Box2D/Box2D.h>

// b2Body create fixture from edge shape
void* b2EdgeShape_CreateFixture(
    void* body,
    // Fixturedef
    double density, double friction, double isSensor,
    double restitution, double userData,
    // filter
    double categoryBits, double groupIndex, double maskBits,
    // circle
    double x0, double y0,
    double x1, double y1) {
  b2FixtureDef def;
  def.density = density;
  def.friction = friction;
  def.isSensor = isSensor;
  def.restitution = restitution;
  def.userData = (void*)&userData;
  def.filter.categoryBits = categoryBits;
  def.filter.groupIndex = groupIndex;
  def.filter.maskBits = maskBits;

  b2Vec2 v0(x0, y0);
  b2Vec2 v1(x1, y1);

  b2EdgeShape edge;
  edge.Set(v0, v1);

  def.shape = &edge;
  return ((b2Body*)body)->CreateFixture(&def);
}
