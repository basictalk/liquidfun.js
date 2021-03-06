#include <Box2D/Box2D.h>
#include <stdio.h>

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

void* b2Vec2_b2Mul(void* transform, void* vec) {
  b2Vec2 temp = b2Mul(*(b2Transform*)transform, *(b2Vec2*)vec);
  return new b2Vec2(temp.x, temp.y);
}
