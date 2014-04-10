#include <Box2D/Box2D.h>
#include <stdio.h>
// b2BodyDef functions
void* b2BodyDef_Create() {
  return new b2BodyDef();
}

void b2BodyDef_Delete(void* def) {
  delete (b2BodyDef*)def;
}

void b2BodyDef_SetPosition(void* b, float x, float y) {
  ((b2BodyDef*)b)->position.Set(x, y);
}

void b2BodyDef_SetType(void* def, float type) {
  ((b2BodyDef*)def)->type = (b2BodyType)type;
}

// b2Body functions
float b2Body_GetAngle(void* body) {
  return ((b2Body*)body)->GetAngle();
}

void* b2Body_GetPosition(void* body) {
  return const_cast<b2Vec2*>(&((b2Body*)body)->GetPosition());
}

void* b2Body_CreateFixture_b2BodyDef(void* body, void* def) {
  return ((b2Body*)body)->CreateFixture((b2FixtureDef*)def);
}

void* b2Body_CreateFixture_b2Shape(void* body, void* shape, float density) {
  return ((b2Body*)body)->CreateFixture((b2Shape*)shape, density);
}
