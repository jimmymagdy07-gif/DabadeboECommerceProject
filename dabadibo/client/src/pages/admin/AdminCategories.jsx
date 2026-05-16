import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api.js";

const empty = { name: "", slug: "", image_url: "", description: "" };

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await api("/api/categories");
      setRows(data);
    } catch (e) {
      setMsg(e.message || "خطأ في التحميل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addCategory = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          image_url: form.image_url.trim() || null,
          description: form.description.trim() || null,
        }),
      });
      setForm(empty);
      setMsg("تمت إضافة الفئة.");
      load();
    } catch (e) {
      setMsg(e.message || "تعذر الإضافة");
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditForm({
      name: c.name,
      slug: c.slug,
      image_url: c.image_url || "",
      description: c.description || "",
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api(`/api/categories/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
          image_url: editForm.image_url.trim() || null,
          description: editForm.description.trim() || null,
        }),
      });
      setEditingId(null);
      setMsg("تم التحديث.");
      load();
    } catch (e) {
      setMsg(e.message || "تعذر الحفظ");
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`حذف الفئة «${c.name}»؟`)) return;
    setMsg("");
    try {
      await api(`/api/categories/${c.id}`, { method: "DELETE" });
      setMsg("تم الحذف.");
      load();
    } catch (e) {
      setMsg(e.message || "تعذر الحذف");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">الفئات</h1>
        <p className="text-sm text-stone-600">إضافة، تعديل، وحذف (لا يُحذف ما فيه منتجات)</p>
      </div>

      {msg && (
        <p className="rounded-2xl bg-daba-beige px-4 py-2 text-sm text-stone-800">{msg}</p>
      )}

      <form
        onSubmit={addCategory}
        className="grid gap-4 rounded-3xl border border-daba-pink/25 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <h2 className="md:col-span-2 text-lg font-bold text-stone-900">إضافة فئة</h2>
        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">الاسم</label>
          <input
            required
            className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-stone-600">Slug</label>
          <input
            required
            className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 font-mono text-sm"
            placeholder="gift-boxes"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-stone-600">رابط الصورة</label>
          <input
            className="w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
            value={form.image_url}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-bold text-stone-600">الوصف</label>
          <textarea
            className="min-h-[72px] w-full rounded-2xl border border-daba-pink/30 px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-daba-gold px-8 py-2.5 text-sm font-bold text-white shadow"
          >
            إضافة
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-daba-pink/25 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-daba-pink/20 text-sm">
          <thead className="bg-daba-beige/80">
            <tr>
              <th className="px-3 py-3 text-start font-semibold">#</th>
              <th className="px-3 py-3 text-start font-semibold">الاسم</th>
              <th className="px-3 py-3 text-start font-semibold">Slug</th>
              <th className="px-3 py-3 text-start font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-daba-pink/15">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : (
              rows.map((c) =>
                editingId === c.id ? (
                  <tr key={c.id} className="bg-daba-pink/10">
                    <td className="px-3 py-3 align-top">{c.id}</td>
                    <td className="px-3 py-3 align-top" colSpan={2}>
                      <form onSubmit={saveEdit} className="space-y-2">
                        <input
                          className="w-full rounded-xl border px-2 py-1 text-sm"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                        <input
                          className="w-full rounded-xl border px-2 py-1 font-mono text-xs"
                          value={editForm.slug}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, slug: e.target.value }))
                          }
                        />
                        <input
                          className="w-full rounded-xl border px-2 py-1 text-xs"
                          placeholder="صورة"
                          value={editForm.image_url}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, image_url: e.target.value }))
                          }
                        />
                        <textarea
                          className="w-full rounded-xl border px-2 py-1 text-xs"
                          rows={2}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="rounded-full bg-daba-gold px-4 py-1 text-xs font-bold text-white"
                          >
                            حفظ
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-full border px-4 py-1 text-xs font-semibold"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    </td>
                    <td className="px-3 py-3 align-top" />
                  </tr>
                ) : (
                  <tr key={c.id} className="hover:bg-daba-beige/40">
                    <td className="px-3 py-3 font-mono text-stone-500">{c.id}</td>
                    <td className="px-3 py-3 font-semibold text-stone-900">{c.name}</td>
                    <td className="px-3 py-3 font-mono text-xs text-stone-600">{c.slug}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded-full bg-daba-pink/50 px-3 py-1 text-xs font-bold"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
