#ifndef B2BODYJSBINDINGS_H
#define B2BODYJSBINDINGS_H

extern "C" {
// b2Body exports
void* b2Body_CreateFixture_b2BodyDef(void* body, void* def);

// b2Body create fixture from circle
void* b2Body_CreateFixture_b2CircleShape(void* body,
                                         // Fixturedef
                                         double density, double friction,
                                         double isSensor, double restitution,
                                         double userData,
                                         // circle
                                         double px, double py,
                                         double radius);

// b2body create fixture from chain
void* b2Body_CreateFixture_b2ChainShape(void* body,
                                         // Fixturedef
                                         double density, double friction,
                                         double isSensor, double restitution,
                                         double userData,
                                         // chain
                                         float* vertices, double length);

// b2Body create fixture from edgeshape
void* b2Body_CreateFixture_b2EdgeShape(void* body,
                                         // Fixturedef
                                         double density, double friction,
                                         double isSensor, double restitution,
                                         double userData,
                                         // circle
                                         double x0, double y0,
                                         double x1, double y1);

// b2Body create fixture from polygonShape
void* b2Body_CreateFixture_b2PolygonShape_3(void* body,
                                            // Fixturedef
                                            double density, double friction,
                                            double isSensor, double restitution,
                                            double userData,
                                            // shape
                                            double x0, double y0,
                                            double x1, double y1,
                                            double x2, double y2);

void* b2Body_CreateFixture_b2PolygonShape_4(void* body,
                                            // Fixturedef
                                            double density, double friction,
                                            double isSensor, double restitution,
                                            double userData,
                                            // shape
                                            double x0, double y0,
                                            double x1, double y1,
                                            double x2, double y2,
                                            double x3, double y3);

void* b2Body_CreateFixture_b2Shape(void* body, void* shape, float density);
float b2Body_GetAngle(void* body);
void* b2Body_GetFixtureList(void* body);
void* b2Body_GetNext(void* body);
void* b2Body_GetPosition(void* body);

void b2Body_GetTransform(void* body, float* arr);
void b2Body_SetAngularVelocity(void* body, double angle);
void b2Body_SetLinearVelocity(void* body, double x, double y);
void b2Body_SetTransform(void* body, double x, double y, double angle);
}
#endif
