#include <Box2D/Box2D.h>

// b2Vec2 functions
void* b2Vec2_Create(float x, float y) {
  return new b2Vec2(x, y);
}

void b2Vec2_Delete(void* v) {
  delete (b2Vec2*)v;
}

float b2Vec2_GetX(void* v) {
  return ((b2Vec2*)v)->x;
}

float b2Vec2_GetY(void* v) {
  return ((b2Vec2*)v)->y;
}

