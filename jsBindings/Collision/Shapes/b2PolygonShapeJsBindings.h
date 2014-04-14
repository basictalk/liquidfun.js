#ifndef B2POLYGONSHAPEJSBINDINGS_H
#define B2POLYGONSHAPEJSBINDINGS_H
extern "C" {
// b2Body create fixture from polygonShape
void* b2PolygonShape_CreateFixture_3(
    void* body,
    // Fixturedef
    double density, double friction,
    double isSensor, double restitution,
    double userData,
    // shape
    double x0, double y0,
    double x1, double y1,
    double x2, double y2);

void* b2PolygonShape_CreateFixture_4(
    void* body,
    // Fixturedef
    double density, double friction,
    double isSensor, double restitution,
    double userData,
    // shape
    double x0, double y0,
    double x1, double y1,
    double x2, double y2,
    double x3, double y3);

// functions to create particle group from polygon
void* b2PolygonShape_CreateParticleGroup_4(
    void* particleSystem,
    // ParticleGroupDef
    double angle, double angularVelocity, double colorR,
    double colorG, double colorB, double colorA, double flags, double group,
    double groupFlags, double lifetime, double linearVelocityX, double linearVelocityY,
    double positionX, double positionY, double positionData, double particleCount,
    double strength, double stride, double userData,
    // shape
    double x0, double y0,
    double x1, double y1,
    double x2, double y2,
    double x3, double y3);

}

#endif
