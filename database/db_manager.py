# db_manager.py
import sqlite3
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import os
import subprocess
import sys

# --- Автоматическая инициализация БД при запуске ---
def ensure_databases():
    db_dir = os.path.dirname(os.path.abspath(__file__))
    main_db = os.path.join(db_dir, "frostrise.db")
    logs_db = os.path.join(db_dir, "frostrise_logs.db")

    # Проверяем, есть ли таблицы в основной БД
    need_init = not os.path.exists(main_db)
    if os.path.exists(main_db):
        try:
            conn = sqlite3.connect(main_db)
            tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
            if len(tables) < 6:  # ожидаем 6 таблиц
                need_init = True
            conn.close()
        except:
            need_init = True

    if need_init:
        print("🔄 БД отсутствуют или повреждены — пересоздаю...")
        from init_db import create_databases
        from populate_db import populate_database
        create_databases()
        populate_database()
    else:
        print("✅ БД уже существуют и валидны")

ensure_databases()

# --- GUI ---
import sqlite3
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Пути к БД (гарантированно в папке скрипта)
db_dir = os.path.dirname(os.path.abspath(__file__))
MAIN_DB_PATH = os.path.join(db_dir, "frostrise.db")
LOGS_DB_PATH = os.path.join(db_dir, "frostrise_logs.db")

class DatabaseManagerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("FrostRise — Менеджер баз данных")
        self.root.geometry("1200x800")
        self.root.configure(bg="#2B2B2B")
        self.current_db = MAIN_DB_PATH
        self.current_table = None

        top_frame = tk.Frame(root, bg="#2B2B2B")
        top_frame.pack(fill=tk.X, padx=10, pady=5)

        tk.Label(top_frame, text="База данных:", fg="white", bg="#2B2B2B").pack(side=tk.LEFT, padx=5)
        self.db_var = tk.StringVar(value=MAIN_DB_PATH)
        db_combo = ttk.Combobox(top_frame, textvariable=self.db_var, state="readonly", width=30)
        db_combo['values'] = [MAIN_DB_PATH, LOGS_DB_PATH]
        db_combo.pack(side=tk.LEFT, padx=5)
        db_combo.bind("<<ComboboxSelected>>", self.on_db_change)

        tk.Label(top_frame, text="Таблица:", fg="white", bg="#2B2B2B").pack(side=tk.LEFT, padx=5)
        self.table_var = tk.StringVar()
        self.table_combo = ttk.Combobox(top_frame, textvariable=self.table_var, state="readonly", width=30)
        self.table_combo.pack(side=tk.LEFT, padx=5)
        self.table_combo.bind("<<ComboboxSelected>>", self.on_table_change)

        tk.Button(top_frame, text="Обновить таблицы", command=self.load_tables, bg="#4A4A4A", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(top_frame, text="Показать структуру", command=self.show_structure, bg="#4A4A4A", fg="white").pack(side=tk.LEFT, padx=5)

        self.tree_frame = tk.Frame(root, bg="#2B2B2B")
        self.tree_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        bottom_frame = tk.Frame(root, bg="#2B2B2B")
        bottom_frame.pack(fill=tk.X, padx=10, pady=5)

        tk.Button(bottom_frame, text="Добавить", command=self.add_record, bg="#4A4A4A", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(bottom_frame, text="Редактировать", command=self.edit_record, bg="#4A4A4A", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(bottom_frame, text="Удалить", command=self.delete_record, bg="#4A4A4A", fg="white").pack(side=tk.LEFT, padx=5)
        tk.Button(bottom_frame, text="Очистить логи", command=self.clear_logs, bg="#DC3545", fg="white").pack(side=tk.RIGHT, padx=5)
        tk.Button(bottom_frame, text="Экспорт в PDF", command=self.export_table_to_pdf, bg="#28A745", fg="white").pack(side=tk.RIGHT, padx=5)

        self.load_tables()

    def on_db_change(self, event):
        self.current_db = self.db_var.get()
        self.load_tables()

    def load_tables(self):
        try:
            conn = sqlite3.connect(self.current_db)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [row[0] for row in cursor.fetchall()]
            conn.close()
            self.table_combo['values'] = tables
            if tables:
                self.table_var.set(tables[0])
                self.load_data()
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось загрузить таблицы:\n{e}")

    def on_table_change(self, event):
        self.current_table = self.table_var.get()
        self.load_data()

    def load_data(self):
        if not self.current_table:
            return

        for widget in self.tree_frame.winfo_children():
            widget.destroy()

        try:
            conn = sqlite3.connect(self.current_db)
            cursor = conn.cursor()
            cursor.execute(f"PRAGMA table_info({self.current_table})")
            columns = [row[1] for row in cursor.fetchall()]
            cursor.execute(f"SELECT * FROM {self.current_table}")
            rows = cursor.fetchall()
            conn.close()

            tree = ttk.Treeview(self.tree_frame, columns=columns, show="headings")
            tree.pack(fill=tk.BOTH, expand=True, side=tk.LEFT)

            for col in columns:
                tree.heading(col, text=col)
                tree.column(col, width=100, anchor=tk.W)

            for row in rows:
                tree.insert("", "end", values=row)

            scrollbar = ttk.Scrollbar(self.tree_frame, orient="vertical", command=tree.yview)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            tree.configure(yscrollcommand=scrollbar.set)

        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось загрузить данные:\n{e}")

    def show_structure(self):
        if not self.current_table:
            messagebox.showwarning("Внимание", "Выберите таблицу для просмотра структуры")
            return

        try:
            conn = sqlite3.connect(self.current_db)
            cursor = conn.cursor()
            cursor.execute(f"PRAGMA table_info({self.current_table})")
            info = cursor.fetchall()
            conn.close()

            win = tk.Toplevel(self.root)
            win.title(f"Структура таблицы: {self.current_table}")
            win.geometry("600x400")
            win.configure(bg="#2B2B2B")

            text_widget = scrolledtext.ScrolledText(win, wrap=tk.WORD, bg="#1E1E1E", fg="white", font=("Courier", 10))
            text_widget.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

            text_widget.insert(tk.END, f"=== Структура таблицы: {self.current_table} ===\n\n")
            for row in info:
                cid, name, type_, notnull, dflt_value, pk = row
                null_str = "NOT NULL" if notnull else "NULL"
                pk_str = "PK" if pk else ""
                text_widget.insert(tk.END, f"{cid}. {name} ({type_}) {null_str} {pk_str}\n")

            text_widget.config(state=tk.DISABLED)

        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось получить структуру:\n{e}")

    def add_record(self):
        messagebox.showinfo("Информация", "Редактирование записей временно недоступно.")

    def edit_record(self):
        messagebox.showinfo("Информация", "Редактирование записей временно недоступно.")

    def delete_record(self):
        messagebox.showinfo("Информация", "Удаление записей временно недоступно.")

    def clear_logs(self):
        if self.current_db != LOGS_DB_PATH:
            messagebox.showwarning("Внимание", "Эта функция доступна только для базы логов")
            return

        if messagebox.askyesno("Подтверждение", "Очистить все логи?"):
            try:
                conn = sqlite3.connect(LOGS_DB_PATH)
                conn.execute("DELETE FROM logs")
                conn.commit()
                conn.close()
                self.load_data()
                messagebox.showinfo("Успех", "Логи очищены!")
            except Exception as e:
                messagebox.showerror("Ошибка", f"Не удалось очистить логи:\n{e}")

    def export_table_to_pdf(self):
        if not self.current_table:
            messagebox.showwarning("Внимание", "Выберите таблицу для экспорта")
            return

        try:
            safe_table_name = self.current_table.replace(" ", "_")
            pdf_filename = f"export_{os.path.splitext(os.path.basename(self.current_db))[0]}_{safe_table_name}.pdf"
            full_path = os.path.join(db_dir, pdf_filename)

            font_registered = False
            font_path = os.path.join(db_dir, 'fonts', 'DejaVuSans.ttf')
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('CustomFont', font_path))
                    font_name = 'CustomFont'
                    font_registered = True
                except:
                    pass

            if not font_registered:
                font_path = "C:/Windows/Fonts/arial.ttf"
                if os.path.exists(font_path):
                    try:
                        pdfmetrics.registerFont(TTFont('CustomFont', font_path))
                        font_name = 'CustomFont'
                        font_registered = True
                    except:
                        pass

            if not font_registered:
                font_name = 'Helvetica'

            doc = SimpleDocTemplate(full_path, pagesize=A4)
            elements = []
            styles = getSampleStyleSheet()

            styles['Title'].fontName = font_name
            styles['Heading2'].fontName = font_name
            styles['Normal'].fontName = font_name

            title = f"Экспорт таблицы '{self.current_table}' из '{os.path.basename(self.current_db)}'"
            elements.append(Paragraph(title, styles['Title']))
            elements.append(Spacer(1, 12))

            conn = sqlite3.connect(self.current_db)
            cursor = conn.cursor()
            cursor.execute(f"PRAGMA table_info({self.current_table})")
            struct_rows = cursor.fetchall()
            conn.close()

            elements.append(Paragraph("Структура таблицы:", styles['Heading2']))
            struct_data = [["№", "Имя", "Тип", "NOT NULL", "PK"]]
            for row in struct_rows:
                cid, name, type_, notnull, dflt_value, pk = row
                notnull_str = "Да" if notnull else "Нет"
                pk_str = "Да" if pk else "Нет"
                struct_data.append([str(cid), name, type_, notnull_str, pk_str])

            struct_table = Table(struct_data)
            struct_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.gray),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), font_name),
                ('FONTSIZE', (0,0), (-1,0), 10),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('GRID', (0,0), (-1,-1), 1, colors.black),
            ]))
            elements.append(struct_table)
            elements.append(Spacer(1, 18))

            conn = sqlite3.connect(self.current_db)
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {self.current_table}")
            data_rows = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
            conn.close()

            elements.append(Paragraph("Содержимое таблицы:", styles['Heading2']))

            if data_rows:
                table_data = [column_names] + data_rows
                content_table = Table(table_data)
                content_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('FONTNAME', (0,0), (-1,0), font_name),
                    ('FONTSIZE', (0,0), (-1,0), 10),
                    ('GRID', (0,0), (-1,-1), 1, colors.black),
                    ('FONTNAME', (0,1), (-1,-1), font_name),
                    ('FONTSIZE', (0,1), (-1,-1), 9),
                ]))
                elements.append(content_table)
            else:
                elements.append(Paragraph("Таблица пуста.", styles['Normal']))

            doc.build(elements)
            messagebox.showinfo("Успех", f"Экспорт завершён!\nФайл сохранён: {full_path}")

        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось создать PDF:\n{e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = DatabaseManagerApp(root)
    root.mainloop()