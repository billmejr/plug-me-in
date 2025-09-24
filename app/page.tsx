import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Check, Filter, Heart, MapPin, MessageCircle, Plus, Send, Star, X } from "lucide-react";

/**
 * Plug Me In — MVP Mock (single-file demo)
 * -------------------------------------------------
 * This is a clickable prototype for core MVP flows:
 *  - Discover feed (talent + gigs in one blended feed) with location/radius filters
 *  - Post a gig (paid/unpaid, tags, location)
 *  - Messages (simple mock thread)
 *  - Profile (public card + editable settings)
 *
 * Design language:
 *  - Tailwind + shadcn/ui
 *  - Soft cards, rounded-2xl, grid layout
 *
 * Notes:
 *  - All data here is fake and local to the component.
 *  - Replace with real backend later (Adalo/Bubble/Supabase/Firebase).
 *  - Keep privacy in mind: user controls for “Searchable by location”, radius, and profile visibility.
 *
 * Draft data model (for Adalo or SQL):
 *  Users(id, name, role, city, lat, lng, bio, tags[], portfolio_urls[], is_visible, searchable_by_location, avatar_url)
 *  Gigs(id, title, org, city, lat, lng, paid:boolean, rate:string, description, tags[], poster_id)
 *  Likes(id, user_id, target_user_id)
 *  Messages(id, from_id, to_id, body, created_at)
 *  Conversations(id) with ConversationMembers(conversation_id, user_id)
 * -------------------------------------------------
 */

const seedPeople = [
  {
    id: "p1",
    name: "Nova J.",
    role: "Director",
    city: "Portland, OR",
    distance: 3, // miles from user (mock)
    tags: ["music video", "fashion", "lo-fi"],
    bio: "Director focused on gritty lo-fi textures and high-energy live shoots.",
  },
  {
    id: "p2",
    name: "Milo A.",
    role: "Photographer",
    city: "Portland, OR",
    distance: 7,
    tags: ["editorial", "film", "portraits"],
    bio: "Portrait + editorial film photography. Always down for test shoots.",
  },
  {
    id: "p3",
    name: "Kita R.",
    role: "Stylist",
    city: "Vancouver, WA",
    distance: 11,
    tags: ["streetwear", "archive", "runway"],
    bio: "Streetwear/archival styling with a focus on texture + silhouette.",
  },
];

const seedGigs = [
  {
    id: "g1",
    title: "R&B video night shoot",
    org: "Indie Artist — ASC3",
    city: "Portland, OR",
    distance: 4,
    paid: true,
    rate: "$250 flat",
    tags: ["director", "dp", "gaffer"],
    description: "Moody nighttime car scene, neon signage, 3-4 hour shoot.",
  },
  {
    id: "g2",
    title: "Lookbook — fall capsule",
    org: "Miliante Worldwide",
    city: "Portland, OR",
    distance: 9,
    paid: false,
    rate: "Unpaid + credits + high-res selects",
    tags: ["photographer", "mua", "stylist"],
    description: "Outdoor editorial with VHS alt-pop vibe. 1 afternoon.",
  },
];

const allTags = [
  "director",
  "dp",
  "editor",
  "photographer",
  "stylist",
  "mua",
  "producer",
  "colorist",
  "fashion",
  "lo-fi",
  "archive",
  "runway",
  "music video",
];

function TagPills({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {values.map((t) => (
        <Badge key={t} variant="secondary" className="rounded-full px-3 py-1 text-xs">
          {t}
        </Badge>
      ))}
    </div>
  );
}

function Header({ onOpenFilters }: { onOpenFilters: () => void }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold">PM</div>
        <h1 className="text-xl font-semibold">Plug Me In</h1>
      </div>
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-2xl"><Filter className="h-4 w-4 mr-2"/>Filters</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[360px] sm:w-[420px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FiltersPanel/>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function useFilters() {
  const [radius, setRadius] = useState<number>(10);
  const [role, setRole] = useState<string>("any");
  const [showPaidOnly, setShowPaidOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  return { radius, setRadius, role, setRole, showPaidOnly, setShowPaidOnly, search, setSearch, selectedTags, setSelectedTags };
}

const FiltersContext = React.createContext<ReturnType<typeof useFilters> | null>(null);

function FiltersProvider({ children }: { children: React.ReactNode }) {
  const state = useFilters();
  return <FiltersContext.Provider value={state}>{children}</FiltersContext.Provider>;
}

function useFiltersContext() {
  const ctx = React.useContext(FiltersContext);
  if (!ctx) throw new Error("FiltersContext used outside provider");
  return ctx;
}

function FiltersPanel() {
  const { radius, setRadius, role, setRole, showPaidOnly, setShowPaidOnly, search, setSearch, selectedTags, setSelectedTags } = useFiltersContext();
  return (
    <div className="space-y-6 py-4">
      <div>
        <div className="text-sm text-muted-foreground mb-2">Search</div>
        <Input placeholder="people, gigs, tags…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-2">Role</div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Any role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="Director">Director</SelectItem>
            <SelectItem value="Photographer">Photographer</SelectItem>
            <SelectItem value="Stylist">Stylist</SelectItem>
            <SelectItem value="MUA">MUA</SelectItem>
            <SelectItem value="Producer">Producer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Radius: {radius} mi</span>
          <MapPin className="h-4 w-4" />
        </div>
        <Slider value={[radius]} min={1} max={50} step={1} onValueChange={(v) => setRadius(v[0])} />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Paid gigs only</div>
        <Switch checked={showPaidOnly} onCheckedChange={setShowPaidOnly} />
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-2">Tags</div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => {
            const active = selectedTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => setSelectedTags(active ? selectedTags.filter((x) => x !== t) : [...selectedTags, t])}
                className={`px-3 py-1 rounded-full text-xs border ${active ? "bg-black text-white" : "bg-white hover:bg-neutral-50"}`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PersonCard({ p }: { p: (typeof seedPeople)[number] }) {
  return (
    <Card className="rounded-2xl hover:shadow-md transition">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{p.name}</span>
          <Badge variant="outline" className="rounded-full">{p.role}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {p.city} • {p.distance} mi
        </div>
        <p className="text-sm leading-snug">{p.bio}</p>
        <TagPills values={p.tags} />
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="rounded-2xl" variant="outline"><Heart className="h-4 w-4 mr-2"/>Save</Button>
          <Button size="sm" className="rounded-2xl"><MessageCircle className="h-4 w-4 mr-2"/>Message</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GigCard({ g }: { g: (typeof seedGigs)[number] }) {
  return (
    <Card className="rounded-2xl hover:shadow-md transition border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{g.title}</span>
          <Badge className="rounded-full" variant={g.paid ? "default" : "secondary"}>{g.paid ? "Paid" : "Unpaid"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">{g.org}</div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> {g.city} • {g.distance} mi
        </div>
        <div className="text-sm"><span className="font-medium">Rate:</span> {g.rate}</div>
        <p className="text-sm leading-snug">{g.description}</p>
        <TagPills values={g.tags} />
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="rounded-2xl" variant="outline"><Star className="h-4 w-4 mr-2"/>Save</Button>
          <Button size="sm" className="rounded-2xl"><Send className="h-4 w-4 mr-2"/>Apply</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BlendFeed() {
  const { radius, role, showPaidOnly, search, selectedTags } = useFiltersContext();

  const items = useMemo(() => {
    // Blend people and gigs into one array with type flags
    const people = seedPeople
      .filter((p) => p.distance <= radius)
      .filter((p) => (role === "any" ? true : p.role === role))
      .filter((p) =>
        selectedTags.length === 0 ? true : selectedTags.some((t) => p.tags.includes(t))
      )
      .filter((p) => (search ? (p.name + p.role + p.city + p.tags.join(" ")).toLowerCase().includes(search.toLowerCase()) : true))
      .map((p) => ({ type: "person" as const, data: p, score: 100 - p.distance }));

    const gigs = seedGigs
      .filter((g) => g.distance <= radius)
      .filter((g) => (showPaidOnly ? g.paid : true))
      .filter((g) =>
        selectedTags.length === 0 ? true : selectedTags.some((t) => g.tags.includes(t))
      )
      .filter((g) => (search ? (g.title + g.org + g.city + g.tags.join(" ")).toLowerCase().includes(search.toLowerCase()) : true))
      .map((g) => ({ type: "gig" as const, data: g, score: (g.paid ? 10 : 0) + (100 - g.distance) }));

    // Sort by score (simple heuristic for relevance)
    return [...people, ...gigs].sort((a, b) => b.score - a.score);
  }, [radius, role, showPaidOnly, search, selectedTags]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {items.map((item) =>
        item.type === "person" ? (
          <PersonCard key={(item.data as any).id} p={item.data as any} />
        ) : (
          <GigCard key={(item.data as any).id} g={item.data as any} />
        )
      )}
    </div>
  );
}

function PostGigDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    org: "",
    paid: false,
    rate: "",
    city: "",
    tags: "",
    description: "",
  });

  const onSubmit = () => {
    // For mock: push into local array (in real app, POST to backend/Adalo Collection)
    alert("Gig posted (mock)! In production, save to database and refresh feed.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl"><Plus className="h-4 w-4 mr-2"/>Post a gig</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl max-w-xl">
        <DialogHeader>
          <DialogTitle>Post a gig</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})}/>
          <Input placeholder="Org / Artist" value={form.org} onChange={(e)=>setForm({...form, org:e.target.value})}/>
          <div className="flex items-center gap-3">
            <Switch checked={form.paid} onCheckedChange={(v)=>setForm({...form, paid:v})}/>
            <span className="text-sm">Paid</span>
            <Input placeholder="Rate (e.g. $200/day)" value={form.rate} onChange={(e)=>setForm({...form, rate:e.target.value})}/>
          </div>
          <Input placeholder="City" value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})}/>
          <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e)=>setForm({...form, tags:e.target.value})}/>
          <Textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}/>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-2xl" onClick={()=>setOpen(false)}><X className="h-4 w-4 mr-2"/>Cancel</Button>
            <Button className="rounded-2xl" onClick={onSubmit}><Check className="h-4 w-4 mr-2"/>Publish</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MessagesMock() {
  const [text, setText] = useState("");
  const [thread, setThread] = useState([
    { id: 1, from: "You", body: "Hey, loved your last video — are you free Saturday?" },
    { id: 2, from: "Nova J.", body: "Possibly! What time + rate?" },
  ]);
  return (
    <div className="p-4 space-y-3">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Chat with Nova J.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 min-h-[160px]">
            {thread.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium">{m.from}: </span>
                <span>{m.body}</span>
              </div>
            ))}
          </div>
          <Separator className="my-3"/>
          <div className="flex gap-2">
            <Input placeholder="Type a message…" value={text} onChange={(e)=>setText(e.target.value)} />
            <Button className="rounded-2xl" onClick={()=>{ if(!text) return; setThread([...thread, { id: Date.now(), from: "You", body: text }]); setText(""); }}>
              <Send className="h-4 w-4 mr-2"/>Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileMock() {
  const [visible, setVisible] = useState(true);
  const [searchable, setSearchable] = useState(true);
  return (
    <div className="p-4 grid gap-4 md:grid-cols-3">
      <Card className="rounded-2xl md:col-span-2">
        <CardHeader>
          <CardTitle>Miliante — Creative / IT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">Portland, OR • Roles: Director, Stylist, Producer</div>
          <p className="text-sm">Blending music, fashion, and visual storytelling. Open to paid shoots, collaborations, and gig swaps.</p>
          <TagPills values={["music video", "fashion", "lo-fi", "producer"]} />
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Privacy & Discovery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Profile visible</span>
            <Switch checked={visible} onCheckedChange={setVisible} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Searchable by location</span>
            <Switch checked={searchable} onCheckedChange={setSearchable} />
          </div>
          <p className="text-xs text-muted-foreground">You’re in control. Toggle off to hide from discovery feeds while still messaging existing contacts.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlugMeInApp() {
  const [tab, setTab] = useState("discover");
  return (
    <FiltersProvider>
      <div className="min-h-screen bg-neutral-50">
        <Header onOpenFilters={()=>{}}/>
        <div className="px-4 pb-4 flex items-center gap-2">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="rounded-2xl grid grid-cols-4 w-full">
              <TabsTrigger value="discover" className="rounded-2xl">Discover</TabsTrigger>
              <TabsTrigger value="gigs" className="rounded-2xl">Gigs</TabsTrigger>
              <TabsTrigger value="messages" className="rounded-2xl">Messages</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-2xl">Profile</TabsTrigger>
            </TabsList>
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-muted-foreground">Find creatives + gigs nearby. Use Filters for radius & tags.</div>
              <PostGigDialog/>
            </div>
            <TabsContent value="discover" className="mt-2">
              <BlendFeed/>
            </TabsContent>
            <TabsContent value="gigs" className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {seedGigs.map((g)=> <GigCard key={g.id} g={g}/>) }
              </div>
            </TabsContent>
            <TabsContent value="messages" className="mt-2">
              <MessagesMock/>
            </TabsContent>
            <TabsContent value="profile" className="mt-2">
              <ProfileMock/>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FiltersProvider>
  );
}
