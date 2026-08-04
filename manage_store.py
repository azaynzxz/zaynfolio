import os
import json
import shutil
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORE_JSON_PATH = os.path.join(BASE_DIR, "src", "data", "store.json")
ASSETS_SRC_DIR = os.path.join(BASE_DIR, "src", "assets", "store")
ASSETS_PUB_DIR = os.path.join(BASE_DIR, "public", "assets", "store")

# Ensure asset directories exist
os.makedirs(ASSETS_SRC_DIR, exist_ok=True)
os.makedirs(ASSETS_PUB_DIR, exist_ok=True)

class StoreManagerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Zaynfolio Store Manager")
        self.geometry("800x600")
        self.products = []
        self.load_data()
        self.build_ui()
        self.populate_list()
        
    def load_data(self):
        if os.path.exists(STORE_JSON_PATH):
            try:
                with open(STORE_JSON_PATH, "r", encoding="utf-8") as f:
                    self.products = json.load(f)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load JSON:\n{e}")
                self.products = []
        else:
            self.products = []

    def build_ui(self):
        # Left Panel
        left_frame = tk.Frame(self, width=250)
        left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)
        
        self.listbox = tk.Listbox(left_frame, exportselection=False)
        self.listbox.pack(side=tk.TOP, fill=tk.BOTH, expand=True)
        self.listbox.bind("<<ListboxSelect>>", self.on_select)
        
        btn_frame = tk.Frame(left_frame)
        btn_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=(10, 0))
        
        ttk.Button(btn_frame, text="Add New Product", command=self.add_product).pack(fill=tk.X, pady=2)
        ttk.Button(btn_frame, text="Delete Selected", command=self.delete_product).pack(fill=tk.X, pady=2)
        save_btn = tk.Button(btn_frame, text="Save to JSON", bg="lightgreen", font=("Arial", 10, "bold"), command=self.save_data)
        save_btn.pack(fill=tk.X, pady=(10, 0), ipady=5)
        
        # Right Panel
        right_frame = tk.Frame(self)
        right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        self.fields = {}
        row = 0
        
        entries = [
            ("id", "ID:"), ("slug", "Slug:"), ("title", "Title:"), 
            ("category", "Category:"), ("price", "Price:"), 
            ("checkoutLink", "Checkout Link:"), ("poster", "Poster Path:")
        ]
        
        for key, label in entries:
            ttk.Label(right_frame, text=label).grid(row=row, column=0, sticky=tk.W, pady=2)
            var = tk.StringVar()
            var.trace_add("write", lambda *args, k=key: self.update_memory(k))
            entry = ttk.Entry(right_frame, textvariable=var, width=50)
            entry.grid(row=row, column=1, sticky=tk.W, pady=2, padx=5)
            self.fields[key] = var
            
            if key == "poster":
                ttk.Button(right_frame, text="Browse...", command=self.browse_image).grid(row=row, column=2, padx=5)
            row += 1
            
        self.featured_var = tk.BooleanVar()
        self.featured_var.trace_add("write", lambda *args: self.update_memory("featured"))
        ttk.Checkbutton(right_frame, text="Featured (Pin to Top)", variable=self.featured_var).grid(row=row, column=1, sticky=tk.W, pady=2, padx=5)
        row += 1
            
        ttk.Label(right_frame, text="Description:").grid(row=row, column=0, sticky=tk.NW, pady=2)
        self.desc_text = tk.Text(right_frame, height=4, width=50)
        self.desc_text.grid(row=row, column=1, columnspan=2, sticky=tk.W, pady=2, padx=5)
        self.desc_text.bind("<KeyRelease>", lambda e: self.update_memory("description"))
        row += 1
        
        ttk.Label(right_frame, text="Features:\n(One per line)").grid(row=row, column=0, sticky=tk.NW, pady=2)
        self.feat_text = tk.Text(right_frame, height=5, width=50)
        self.feat_text.grid(row=row, column=1, columnspan=2, sticky=tk.W, pady=2, padx=5)
        self.feat_text.bind("<KeyRelease>", lambda e: self.update_memory("features"))
        
    def populate_list(self):
        self.listbox.delete(0, tk.END)
        for p in self.products:
            self.listbox.insert(tk.END, p.get("title", "Untitled"))
        if self.products:
            self.listbox.selection_set(0)
            self.on_select(None)
            
    def on_select(self, event):
        sel = self.listbox.curselection()
        if not sel:
            return
        idx = sel[0]
        prod = self.products[idx]
        
        # Disable tracking temporarily to prevent recursive updates
        self._updating_ui = True
        
        for key in ["id", "slug", "title", "category", "price", "checkoutLink", "poster"]:
            self.fields[key].set(prod.get(key, ""))
            
        self.featured_var.set(prod.get("featured", False))
            
        self.desc_text.delete("1.0", tk.END)
        self.desc_text.insert(tk.END, prod.get("description", ""))
        
        self.feat_text.delete("1.0", tk.END)
        features = prod.get("features", [])
        if isinstance(features, list):
            self.feat_text.insert(tk.END, "\n".join(features))
            
        self._updating_ui = False
        
    def update_memory(self, key):
        if getattr(self, "_updating_ui", False):
            return
            
        sel = self.listbox.curselection()
        if not sel:
            return
        idx = sel[0]
        
        if key in self.fields:
            self.products[idx][key] = self.fields[key].get()
        elif key == "featured":
            self.products[idx]["featured"] = self.featured_var.get()
        elif key == "description":
            self.products[idx]["description"] = self.desc_text.get("1.0", tk.END).strip()
        elif key == "features":
            text = self.feat_text.get("1.0", tk.END).strip()
            self.products[idx]["features"] = [line.strip() for line in text.split("\n") if line.strip()]
            
        if key == "title":
            # Update listbox text
            self.listbox.delete(idx)
            self.listbox.insert(idx, self.fields["title"].get())
            self.listbox.selection_set(idx)
            
    def add_product(self):
        new_prod = {
            "id": "new_product",
            "slug": "new-product",
            "title": "New Product",
            "description": "",
            "price": "Rp 0",
            "checkoutLink": "",
            "poster": "",
            "category": "",
            "featured": False,
            "features": []
        }
        self.products.append(new_prod)
        self.listbox.insert(tk.END, new_prod["title"])
        self.listbox.selection_clear(0, tk.END)
        self.listbox.selection_set(len(self.products) - 1)
        self.on_select(None)
        
    def delete_product(self):
        sel = self.listbox.curselection()
        if not sel: return
        idx = sel[0]
        
        if messagebox.askyesno("Confirm", f"Delete '{self.products[idx].get('title', '')}'?"):
            del self.products[idx]
            self.populate_list()
            
    def browse_image(self):
        filepath = filedialog.askopenfilename(
            title="Select Product Image",
            filetypes=[("Image Files", "*.jpg *.jpeg *.png *.gif *.webp *.avif")]
        )
        if filepath:
            filename = os.path.basename(filepath)
            dest_src = os.path.join(ASSETS_SRC_DIR, filename)
            dest_pub = os.path.join(ASSETS_PUB_DIR, filename)
            
            try:
                shutil.copy2(filepath, dest_src)
                shutil.copy2(filepath, dest_pub)
                
                self.fields["poster"].set(f"/assets/store/{filename}")
                self.update_memory("poster")
                messagebox.showinfo("Success", "Image copied successfully to assets folders!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to copy image:\n{e}")

    def save_data(self):
        try:
            with open(STORE_JSON_PATH, "w", encoding="utf-8") as f:
                json.dump(self.products, f, indent=2, ensure_ascii=False)
            messagebox.showinfo("Success", "Saved successfully to store.json!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save JSON:\n{e}")

if __name__ == "__main__":
    app = StoreManagerApp()
    app.mainloop()
