#include <Box2D/Box2D.h>
// b2Body functions
void b2Body_ApplyForce(void* body, double forceX, double forceY,
                       double pointX, double pointY, double wake) {
  ((b2Body*)body)->ApplyForce(b2Vec2(forceX, forceY), b2Vec2(pointX, pointY),
                              (bool)wake);
}
void b2Body_ApplyTorque(void* body, double force, double wake) {
  ((b2Body*)body)->ApplyTorque(force, (bool)wake);
}

double b2Body_GetAngle(void* body) {
  return ((b2Body*)body)->GetAngle();
}

double b2Body_GetInertia(void* body) {
  return ((b2Body*)body)->GetInertia();
}

double b2Body_GetMass(void* body) {
  return ((b2Body*)body)->GetMass();
}

void b2Body_GetPosition(void* body, float* arr) {
  b2Vec2 pos = ((b2Body*)body)->GetPosition();
  arr[0] = pos.x;
  arr[1] = pos.y;
}

void b2Body_GetTransform(void* body, float* arr) {
  b2Transform* t = const_cast<b2Transform*>(&((b2Body*)body)->GetTransform());

  arr[0] = (double)t->p.x;
  arr[1] = (double)t->p.y;
  arr[2] = (double)t->q.s;
  arr[3] = (double)t->q.c;
}

void* b2Body_GetTransform(void* body) {
  return const_cast<b2Transform*>(&((b2Body*)body)->GetTransform());
}

void b2Body_GetWorldPoint(void* body, double pointX, double pointY, float* arr) {
  b2Vec2 worldPoint = ((b2Body*)body)->GetWorldPoint(b2Vec2(pointX, pointY));
  arr[0] = worldPoint.x;
  arr[1] = worldPoint.y;
}

void b2Body_GetWorldVector(void* body, double vX, double vY, float* arr) {
  b2Vec2 worldVec = ((b2Body*)body)->GetWorldPoint(b2Vec2(vX, vY));
  arr[0] = worldVec.x;
  arr[1] = worldVec.y;
}

void b2Body_SetAngularVelocity(void* body, double angle) {
  ((b2Body*)body)->SetAngularVelocity(angle);
}

void b2Body_SetLinearVelocity(void* body, double x, double y) {
  ((b2Body*)body)->SetLinearVelocity(b2Vec2(x, y));
}

void b2Body_SetTransform(void* body, double x, double y, double angle) {
  ((b2Body*)body)->SetTransform(b2Vec2(x, y), angle);
}
