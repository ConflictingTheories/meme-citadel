# User Authentication Flow Diagram

## Component Hierarchy & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                             │
│                                                             │
│  State:                                                     │
│  • currentUser (null | userData)                           │
│  • activeView (LANDING | IDENTITY | FEED | ...)          │
│                                                             │
│  Handlers:                                                  │
│  • handleEnterCitadel() - requires identity check         │
│  • handleUserIdentified(user) - stores user state         │
│  • handleExploreNode(nodeId) - updates graph root        │
└─────────────────────────────────────────────────────────────┘
                          ↓
         ┌─────────────────────────────────────┐
         │  Routes Based on currentUser        │
         │  & activeView                       │
         └─────────────────────────────────────┘
        ↙         ↓        ↓        ↓        ↘
    ┌──────┐  ┌────────┐  ┌──────┐ ┌──────┐  ┌──────┐
    │Landing│  │Identity│  │ Feed │ │Graph │  │Debates
    │Page   │  │        │  │      │ │      │  │
    │ [×]   │  │[✓auth] │  │ [✓]  │ │[✓]   │  │[✓]
    └──────┘  └────────┘  └──────┘ └──────┘  └──────┘
         ↓         ↓        
    "Enter        "Confirm"
    Citadel"    "Identity"
         ↓         ↓
         └────→ User State Set
              (currentUser != null)
```

## Authentication Gate Examples

### SUBMIT Route (Posting New Memes)
```
User clicks "Contribute" →
    ↓
Check: currentUser exists?
    ↙                ↘
  NO                YES
  ↓                  ↓
Show Modal      Show Form
"Identify       (userId={currentUser.id})
yourself"  
  ↓
[Identify] → Sets currentUser → Refreshes component
```

### VERIFY Route (Evidence Verification)
```
User clicks "Verify" →
    ↓
Check: currentUser exists?
    ↙                ↘
  NO                YES
  ↓                  ↓
Show Modal      Show Queue
"Identify       (userId={currentUser.id})
yourself"
  ↓
[Identify] → Sets currentUser → Can now verify evidence
```

## Graph Exploration Flow

```
MemeFeed (FEED View)
    ↓
User clicks meme → handleSelectMeme(nodeId)
    ↓
App: rootNodeId = nodeId, activeView = GRAPH
    ↓
GraphView Component Renders
├─ Fetches graph data for rootNodeId
├─ Displays force-directed graph
└─ Shows InspectorPanel on node click
    ↓
User inspects connected node
    ↓
User clicks "Explore Deeper Connections"
    ↓
InspectorPanel calls onExploreConnections(newNodeId)
    ↓
GraphView calls onExploreNode(newNodeId) [NEW]
    ↓
App: handleExploreNode(newNodeId)
├─ rootNodeId = newNodeId
├─ activeView = GRAPH
└─ GraphView useEffect re-runs with new rootNodeId
    ↓
Graph reloads with new node as root
    ↓
Infinite exploration possible!
```

## Identification Flow

```
Landing Page
    ↓
handleEnterCitadel()
    ↓
currentUser == null?
    ↙              ↘
   YES            NO
    ↓              ↓
IDENTITY      FEED
View          View
    ↓
IdentityFingerprint Component
├─ collectFingerprint()
├─ Generate device fingerprint
├─ Create user profile
└─ Show results
    ↓
User sees profile details:
├─ Public ID
├─ Trust Score
├─ Reputation
├─ Account Age
└─ Contributions
    ↓
[Confirm Identity & Enter Citadel]
    ↓
onIdentified(user) callback
    ↓
App: setCurrentUser(user)
App: setActiveView(VIEWS.FEED)
    ↓
FEED View Available ✓
All Protected Routes Unlocked ✓
```

## User Experience Timeline

```
Time 0: Fresh User
├─ App mounts
├─ currentUser = null
├─ activeView = LANDING
└─ Can only see landing page

Time 1: Click "Enter Citadel"
├─ handleEnterCitadel() checks currentUser
├─ currentUser is null
├─ Redirects to IDENTITY view
└─ IdentityFingerprint loads

Time 2-5: Collecting Fingerprint
├─ Device fingerprinting in progress
├─ Trust score calculated
├─ User profile generated
└─ Loading spinner shown

Time 5+: Identification Complete
├─ Profile details displayed
├─ User sees trust score, reputation
├─ "Confirm Identity & Enter Citadel" available
└─ Can click button or stay on ID page

Time 6: Click Confirm
├─ onIdentified(user) called
├─ App.setCurrentUser(user)
├─ currentUser != null (authentication set)
├─ activeView = FEED
└─ All routes now accessible

Time 7+: Full Access
├─ FEED - Browse memes ✓
├─ IDENTITY - View profile ✓
├─ DEBATES - Read/participate ✓
├─ SUBMIT - Post memes ✓
├─ VERIFY - Validate evidence ✓
└─ GRAPH - Explore connections ✓
```

## Code Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ App.jsx: renderActiveView() Switch Statement            │
└─────────────────────────────────────────────────────────┘
         ↓
┌─ LANDING: <LandingPage onEnter={handleEnterCitadel} />
├─ IDENTITY: <IdentityFingerprint onIdentified={handleUserIdentified} />
│                                      ↑
│                                      │
├─ FEED: <MemeFeed ... />              │
├─ GRAPH: <GraphView onExploreNode={handleExploreNode} />
│              ↑                       │
│              │                       │
├─ SUBMIT: if (!currentUser) → Auth Gate else → <SubmissionForm />
├─ VERIFY: if (!currentUser) → Auth Gate else → <VerificationQueue />
└─ DEBATES: <DebateList currentUser={currentUser} />

        User Identification Path:
        
        LandingPage
             ↓
        [Enter Citadel]
             ↓
        currentUser == null? 
             ↓ YES
        IDENTITY (IdentityFingerprint)
             ↓
        [Confirm Identity & Enter Citadel]
             ↓
        onIdentified(user)
        (passed from App)
             ↓
        handleUserIdentified(user)
             ↓
        setCurrentUser(user)
             ↓
        setActiveView(FEED)
             ↓
        FEED (Full Access Unlocked)
```

## Protected vs Public Routes

```
┌──────────────┬──────────────────────┬────────────────┐
│ Route        │ Authentication Need  │ User Context   │
├──────────────┼──────────────────────┼────────────────┤
│ LANDING      │ No                   │ Not needed     │
│ IDENTITY     │ Optional (for auth)  │ Sets state     │
│ FEED         │ No (accessible)      │ Optional       │
│ GRAPH        │ No (data driven)     │ Optional       │
│ DEBATES      │ No (reading OK)      │ currentUser    │
├──────────────┼──────────────────────┼────────────────┤
│ SUBMIT       │ YES (protected)      │ userId required│
│ VERIFY       │ YES (protected)      │ userId required│
└──────────────┴──────────────────────┴────────────────┘

Protected Route Behavior:
if (!currentUser) {
  return <AuthenticationGateUI>
    [Identify Myself] → Navigate to IDENTITY
  </AuthenticationGateUI>
} else {
  return <ActualComponent userId={currentUser.id} />
}
```

## Event Chain: Graph Exploration

```
User clicks node in GraphView
    ↓
nodeClick handler
    ↓ selectedNode = node
    ↓ InspectorPanel shows node details
    ↓
User clicks "Explore Deeper Connections"
    ↓
InspectorPanel.onExploreConnections(nodeId)
    ↓ nodeId = clicked node's ID
    ↓
GraphView.onExploreNode(nodeId)  [Now wired up!]
    ↓
App.handleExploreNode(nodeId)
    ↓ rootNodeId = nodeId
    ↓ activeView = GRAPH (keep in graph)
    ↓
GraphView.useEffect triggers
    ↓ dependency: rootNodeId changed
    ↓
fetchGraph(newRootNodeId, depth)
    ↓
Graph re-renders with new root
    ↓
User can explore deeper!
```

---

## Summary

The system now has:
1. **Authentication State**: currentUser tracks if identified
2. **Authentication Gates**: SUBMIT and VERIFY require currentUser
3. **Automatic Redirects**: Landing page redirects unidentified users to IDENTITY
4. **User Propagation**: currentUser passed to components needing it
5. **Graph Interactivity**: Clicking "Explore" changes graph root and refetches
6. **Component Integration**: All modified components properly wired together
