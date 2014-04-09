# Makefile for generating a Box2D library using Emscripten.

# For placing path overrides.. this path is hidden from git
-include Makefile.local

PYTHON=$(ENV) python

O = Box2D/Box2D
OBJECTS = \
$(O)/Rope/b2Rope.cpp \
$(O)/Collision/b2TimeOfImpact.cpp \
$(O)/Collision/b2Distance.cpp \
$(O)/Collision/Shapes/b2EdgeShape.cpp \
$(O)/Collision/Shapes/b2PolygonShape.cpp \
$(O)/Collision/Shapes/b2CircleShape.cpp \
$(O)/Collision/Shapes/b2ChainShape.cpp \
$(O)/Collision/b2BroadPhase.cpp \
$(O)/Collision/b2CollideCircle.cpp \
$(O)/Collision/b2DynamicTree.cpp \
$(O)/Collision/b2CollideEdge.cpp \
$(O)/Collision/b2CollidePolygon.cpp \
$(O)/Collision/b2Collision.cpp \
$(O)/Dynamics/b2Island.cpp \
$(O)/Dynamics/b2WorldCallbacks.cpp \
$(O)/Dynamics/Joints/b2MouseJoint.cpp \
$(O)/Dynamics/Joints/b2MotorJoint.cpp \
$(O)/Dynamics/Joints/b2DistanceJoint.cpp \
$(O)/Dynamics/Joints/b2FrictionJoint.cpp \
$(O)/Dynamics/Joints/b2WeldJoint.cpp \
$(O)/Dynamics/Joints/b2GearJoint.cpp \
$(O)/Dynamics/Joints/b2PrismaticJoint.cpp \
$(O)/Dynamics/Joints/b2RopeJoint.cpp \
$(O)/Dynamics/Joints/b2Joint.cpp \
$(O)/Dynamics/Joints/b2RevoluteJoint.cpp \
$(O)/Dynamics/Joints/b2WheelJoint.cpp \
$(O)/Dynamics/Joints/b2PulleyJoint.cpp \
$(O)/Dynamics/Contacts/b2ChainAndPolygonContact.cpp \
$(O)/Dynamics/Contacts/b2Contact.cpp \
$(O)/Dynamics/Contacts/b2PolygonAndCircleContact.cpp \
$(O)/Dynamics/Contacts/b2CircleContact.cpp \
$(O)/Dynamics/Contacts/b2ContactSolver.cpp \
$(O)/Dynamics/Contacts/b2EdgeAndCircleContact.cpp \
$(O)/Dynamics/Contacts/b2ChainAndCircleContact.cpp \
$(O)/Dynamics/Contacts/b2EdgeAndPolygonContact.cpp \
$(O)/Dynamics/Contacts/b2PolygonContact.cpp \
$(O)/Dynamics/b2Fixture.cpp \
$(O)/Dynamics/b2World.cpp \
$(O)/Dynamics/b2Body.cpp \
$(O)/Dynamics/b2ContactManager.cpp \
$(O)/Particle/b2VoronoiDiagram.cpp \
$(O)/Particle/b2ParticleGroup.cpp \
$(O)/Particle/b2ParticleSystem.cpp \
$(O)/Particle/b2Particle.cpp \
$(O)/Common/b2FreeList.cpp \
$(O)/Common/b2BlockAllocator.cpp \
$(O)/Common/b2Draw.cpp \
$(O)/Common/b2Math.cpp \
$(O)/Common/b2Stat.cpp \
$(O)/Common/b2Timer.cpp \
$(O)/Common/b2Settings.cpp \
$(O)/Common/b2TrackedBlock.cpp \
$(O)/Common/b2StackAllocator.cpp

bindings.js:
	$(CXX) --bind -IBox2D -o hello_world.js bindings.cpp jsBindings/jsBindings.cpp $(OBJECTS)

