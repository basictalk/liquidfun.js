extern "C" {
#include "Collision/b2CollisionJsBindings.h"
#include "Collision/Shapes/b2ChainShapeJsBindings.h"
#include "Collision/Shapes/b2CircleShapeJsBindings.h"
#include "Collision/Shapes/b2EdgeShapeJsBindings.h"
#include "Collision/Shapes/b2PolygonShapeJsBindings.h"
#include "Dynamics/b2BodyJsBindings.h"
#include "Dynamics/b2FixtureJsBindings.h"
#include "Dynamics/b2WorldJsBindings.h"
#include "Dynamics/Contacts/b2ContactJsBindings.h"
#include "Dynamics/Joints/b2DistanceJointJsBindings.h"
#include "Dynamics/Joints/b2FrictionJointJsBindings.h"
#include "Dynamics/Joints/b2GearJointJsBindings.h"
#include "Dynamics/Joints/b2JointJsBindings.h"
#include "Dynamics/Joints/b2MotorJointJsBindings.h"
#include "Dynamics/Joints/b2MouseJointJsBindings.h"
#include "Dynamics/Joints/b2PrismaticJointJsBindings.h"
#include "Dynamics/Joints/b2PulleyJointJsBindings.h"
#include "Dynamics/Joints/b2RevoluteJointJsBindings.h"
#include "Dynamics/Joints/b2RopeJointJsBindings.h"
#include "Dynamics/Joints/b2WeldJointJsBindings.h"
#include "Dynamics/Joints/b2WheelJointJsBindings.h"
#include "Particle/b2ParticleSystemJsBindings.h"
}
#include "Collision/b2CollisionJsBindings.cpp"
#include "Collision/Shapes/b2ChainShapeJsBindings.cpp"
#include "Collision/Shapes/b2CircleShapeJsBindings.cpp"
#include "Collision/Shapes/b2EdgeShapeJsBindings.cpp"
#include "Collision/Shapes/b2PolygonShapeJsBindings.cpp"
#include "Dynamics/b2BodyJsBindings.cpp"
#include "Dynamics/b2FixtureJsBindings.cpp"
#include "Dynamics/b2WorldJsBindings.cpp"
#include "Dynamics/Contacts/b2ContactJsBindings.cpp"
#include "Dynamics/Joints/b2DistanceJointJsBindings.cpp"
#include "Dynamics/Joints/b2FrictionJointJsBindings.cpp"
#include "Dynamics/Joints/b2GearJointJsBindings.cpp"
#include "Dynamics/Joints/b2JointJsBindings.cpp"
#include "Dynamics/Joints/b2MotorJointJsBindings.cpp"
#include "Dynamics/Joints/b2MouseJointJsBindings.cpp"
#include "Dynamics/Joints/b2PrismaticJointJsBindings.cpp"
#include "Dynamics/Joints/b2PulleyJointJsBindings.cpp"
#include "Dynamics/Joints/b2RevoluteJointJsBindings.cpp"
#include "Dynamics/Joints/b2RopeJointJsBindings.cpp"
#include "Dynamics/Joints/b2WeldJointJsBindings.cpp"
#include "Dynamics/Joints/b2WheelJointJsBindings.cpp"
#include "Particle/b2ParticleSystemJsBindings.cpp"

#include <stdio.h>
void PrintOffsets(b2Body* b) {
  printf("\tb2Body: {\n");
  printf("\t\ttype: %u,\n", (unsigned int)&b->m_type - (unsigned int)b);
  printf("\t\tislandIndex: %u,\n", (unsigned int)&b->m_islandIndex - (unsigned int)b);
  printf("\t\txf: %u,\n", (unsigned int)&b->m_xf - (unsigned int)b);
  printf("\t\tuserData: %u\n", (unsigned int)&b->m_userData - (unsigned int)b);
  printf("\t}\n");
  /*
  b2BodyType m_type;

    uint16 m_flags;

    int32 m_islandIndex;

    b2Transform m_xf;   // the body origin transform
    b2Transform m_xf0;    // the previous transform for particle simulation
    b2Sweep m_sweep;    // the swept motion for CCD

    b2Vec2 m_linearVelocity;
    float32 m_angularVelocity;

    b2Vec2 m_force;
    float32 m_torque;

    b2World* m_world;
    b2Body* m_prev;
    b2Body* m_next;

    b2Fixture* m_fixtureList;
    int32 m_fixtureCount;

    b2JointEdge* m_jointList;
    b2ContactEdge* m_contactList;

    float32 m_mass, m_invMass;

    // Rotational inertia about the center of mass.
    float32 m_I, m_invI;

    float32 m_linearDamping;
    float32 m_angularDamping;
    float32 m_gravityScale;

    float32 m_sleepTime;

    void* m_userData;*/
}
