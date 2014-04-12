#include <Box2D/Box2D.h>

void* b2CircleShape_Create() {
  return new b2CircleShape();
}

void b2CircleShape_Delete(void* circle) {
  delete (b2CircleShape*)circle;
}

void b2CircleShape_SetPosition(void* circle, float x, float y) {
  ((b2CircleShape*)circle)->m_p.Set(x, y);
}
