#include <Box2D/Box2D.h>

void* b2PolygonShape_Create() {
  return new b2PolygonShape;
}

void b2PolygonShape_Delete(void* polygon) {
  delete (b2PolygonShape*)polygon;
}

void* b2PolygonShape_GetCentroid(void* polygon) {
  return &((b2PolygonShape*)polygon)->m_centroid;
}

void* b2PolygonShape_GetVertex(void* polygon, float index) {
  return const_cast<b2Vec2*>(&((b2PolygonShape*)polygon)->GetVertex((int)index));
}

float b2PolygonShape_GetVertexCount(void* polygon) {
  return ((b2PolygonShape*)polygon)->GetVertexCount();
}

void b2PolygonShape_SetAsBox_xy(void* polygon, float32 x, float32 y) {
  ((b2PolygonShape*)polygon)->SetAsBox(x, y);
}
