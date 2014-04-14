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
	
B2BODY = \
	'_b2Body_ApplyTorque', \
	'_b2Body_ApplyForce', \
	'_b2Body_GetAngle', \
	'_b2Body_GetInertia', \
	'_b2Body_GetMass', \
	'_b2Body_GetPosition', \
	'_b2Body_GetTransform', \
	'_b2Body_GetWorldPoint', \
	'_b2Body_GetWorldVector', \
	'_b2Body_SetAngularVelocity', \
	'_b2Body_SetLinearVelocity', \
	'_b2Body_SetTransform'
	
B2CHAINSHAPE = \
	'_b2ChainShape_CreateFixture'	
	
B2CIRCLESHAPE = \
	'_b2CircleShape_CreateFixture', \
	'_b2CircleShape_CreateParticleGroup'

B2EDGESHAPE = \
	'_b2EdgeShape_CreateFixture'

B2POLYGONSHAPE = \
	'_b2PolygonShape_CreateFixture_3', \
	'_b2PolygonShape_CreateFixture_4', \
	'_b2PolygonShape_CreateParticleGroup_4'

B2FRICTIONJOINT = \
	'_b2FrictionJointDef_CreateJoint'

B2REVOLUTEJOINT = \
	'_b2RevoluteJoint_InitializeAndCreate', \
	'_b2RevoluteJoint_SetMotorSpeed'

B2PARTICLESYSTEM = \
	'_b2ParticleSystem_CreateParticle', \
	'_b2ParticleSystem_GetParticleCount', \
	'_b2ParticleSystem_GetPositionBuffer', \
	'_b2ParticleSystem_SetDamping', \
	'_b2ParticleSystem_SetDensity', \
	'_b2ParticleSystem_SetRadius'
	
B2WORLD = \
	'_b2World_Create', \
	'_b2World_CreateBody', \
	'_b2World_CreateParticleSystem',\
	'_b2World_Delete', \
	'_b2World_SetContactListener', \
	'_b2World_SetGravity', \
	'_b2World_Step'
	
EXPORTS = EXPORTED_FUNCTIONS="[ \
	$(B2BODY), \
	$(B2CHAINSHAPE), \
	$(B2CIRCLESHAPE), \
	$(B2EDGESHAPE), \
	$(B2PARTICLESYSTEM), \
	$(B2POLYGONSHAPE), \
	$(B2FRICTIONJOINT), \
	$(B2REVOLUTEJOINT), \
	$(B2WORLD) \
	]"

bindings.js:
	$(EMSCRIPTEN)/emcc -IBox2D -o hello_world.js jsBindings/jsBindings.cpp $(OBJECTS) -s $(EXPORTS) -s TOTAL_MEMORY=33554432 -O0 --js-library callbacks.js

