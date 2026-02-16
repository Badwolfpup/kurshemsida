import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePosts, useAddPost, useUpdatePost, useDeletePost } from "@/hooks/usePosts";
import type PostType from "@/Types/PostType";

export default function AdminPosts() {
  const { data: posts = [], isLoading } = usePosts();
  const addPost = useAddPost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const { user } = useAuth();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPost, setEditPost] = useState<PostType | null>(null);
  const [form, setForm] = useState({ html: "", publishDate: new Date().toISOString().split("T")[0] });

  const openAdd = () => {
    setEditPost(null);
    setForm({ html: "", publishDate: new Date().toISOString().split("T")[0] });
    setDialogOpen(true);
  };

  const openEdit = (p: PostType) => {
    setEditPost(p);
    setForm({
      html: p.html || "",
      publishDate: p.publishedAt ? String(p.publishedAt).split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.html.trim()) return;
    if (editPost) {
      updatePost.mutate(
        { id: editPost.id, html: form.html, publishDate: form.publishDate },
        {
          onSuccess: () => {
            toast({ title: "Uppdaterad", description: "Nyheten har uppdaterats." });
            setDialogOpen(false);
          },
        }
      );
    } else {
      addPost.mutate(
        { userId: user?.id || 0, html: form.html, delta: "", publishDate: form.publishDate },
        {
          onSuccess: () => {
            toast({ title: "Skapad", description: "Nyheten har publicerats." });
            setDialogOpen(false);
          },
        }
      );
    }
  };

  const remove = (id: number) => {
    deletePost.mutate(id, {
      onSuccess: () => toast({ title: "Borttagen" }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Skapa nyhet
        </Button>
        <Badge variant="secondary">{posts.length} nyheter</Badge>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="bg-card rounded-2xl shadow-card border border-border p-8 text-center">
            <p className="text-muted-foreground">Inga nyheter ännu.</p>
          </div>
        )}
        {posts.map((p) => (
          <div key={p.id} className="bg-card rounded-2xl shadow-card border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg text-foreground">{p.author || "Okänd"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Publicerad: {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("sv-SE") : "—"}
                </p>
                <div className="text-foreground mt-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p.html || "" }} />
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPost ? "Redigera nyhet" : "Skapa nyhet"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea placeholder="HTML-innehåll" value={form.html} onChange={(e) => setForm({ ...form, html: e.target.value })} rows={8} />
            <Input type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Avbryt</Button>
            <Button onClick={save}>{editPost ? "Spara" : "Publicera"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
