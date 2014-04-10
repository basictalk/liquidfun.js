#include <Box2D/Box2D.h>
#include<stdio.h>
// b2World Exports
void b2World_Step(void* world, float step, float vIterations, float pIterations) {
  ((b2World*)world)->Step(step, (int32)vIterations, (int32)pIterations);
}

void* b2World_CreateBody(void* world, void* def) {
  return ((b2World*)world)->CreateBody((b2BodyDef*)def);
}

void* b2World_Create(void* gravity) {
  return new b2World(*(b2Vec2*)gravity);
}

void b2World_Delete(void* world) {
  delete (b2World*)world;
}
