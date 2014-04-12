#include <Box2D/Box2D.h>

float b2Shape_GetType(void* shape) {
  return ((b2Shape*)shape)->GetType();
}

void b2Shape_SetRadius(void* shape, float radius) {
  ((b2Shape*)shape)->m_radius = radius;
}
