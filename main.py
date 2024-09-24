import os,json,csv,threading,asyncio
from flask import Flask,request,session,redirect,url_for,send_file
from flask.templating import render_template,DispatchingJinjaLoader
from flask_bcrypt import Bcrypt
from flask_login import UserMixin,login_user,logout_user,current_user,LoginManager
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column,DateTime
from datetime import datetime
from flask_migrate import Migrate
from flask import jsonify

endings = {'Text':'txt',"Json":'json',"Csv":'csv'}
app = Flask(__name__)
app.config["SECRET_KEY"] = 'LA'
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"
app.template_folder = os.path.join("templates")
app.static_folder = os.path.join("static")
bcrypt = Bcrypt(app)
db = SQLAlchemy(app)
migrate = Migrate(app,db,compare_type=True,render_as_batch=True)
login_manager = LoginManager(app)
login_manager.init_app(app)


class User(db.Model,UserMixin):
    id=Column(db.Integer,primary_key=True)
    Username=Column(db.String(20),unique=True,nullable=False)
    Password=Column(db.String,nullable=False)
    Email=Column(db.String,nullable=False)
    Created_date=Column(DateTime,default=datetime.utcnow)
    def __repr__(self) -> str:
        return self.Username    
class Document(db.Model):
    __tablename__ = "Document"
    Id=Column(db.Integer,primary_key=True)
    DocumentName=Column(db.String(20),default="A real document",nullable=False)
    DocumentType=Column(db.String(10),default="Text",nullable=False)
    Created_date=Column(DateTime,default=datetime.utcnow,nullable=False)
    Content=Column(db.String(9999**999),default="",nullable=False)
    Author_id=Column(db.Integer,nullable=False)
# Função para carregar o usuário

def deleteFile(ID,extencion):
    print(f"static/files/{ID}.{extencion}")
    try:    
        if os.path.exists(f"static/files/{ID}.{extencion}"):
            os.remove(f"static/files/{ID}.{extencion}")
    except KeyError:
        print(KeyError)  
                          

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)  # Carrega o usuário com base no ID


@app.route("/",methods=["POST","GET"])
def page_home():
    if not current_user.is_authenticated:
        return redirect("/login")
    context = {
        'documents' : [],
    }
    jsonified = False
    if request.method == "POST" and request.form != None and 'action' in request.form and 'project_id' in request.form:
        form = request.form
        target_document = Document.query.filter_by(Author_id = current_user.id,Id=form['project_id']).first()
        if target_document:
            if form['action'] == "delete":
                try:
                    ID = target_document.Id
                    
                    thread = threading.Thread(
                        target=deleteFile,
                        args=[ID,endings[target_document.DocumentType]],
                        daemon=True
                    )

                    thread.run()

                    db.session.delete(target_document)
                    db.session.commit()
                    jsonified = True
                    

                    return jsonify({'proceed':'true'})
                except:
                    db.session.rollback()
                    jsonified = True
                    return jsonify({'proceed':'false'})

    if request.form:
        form = request.form
        if 'doctype' in form and 'docname' in form and current_user.is_authenticated:
            
            print(form['docname'],form["doctype"])
            new_doc = Document(Author_id=current_user.id,DocumentName=form['docname'],DocumentType=form["doctype"])
            db.session.add(new_doc)
            db.session.commit()
            if not jsonified:
                return redirect("/")
    for doc in Document.query.filter_by(Author_id=current_user.id).all(     ):
        context['documents'].append([doc.Id,doc.Content,doc.DocumentName,doc.DocumentType])
    
    if not jsonified:
        return render_template("home.html",context=context)

@app.route("/download/<string:id>",methods=["POST","GET"])
def page_download(id):
    return send_file(path_or_file=f"static/files/{id}",as_attachment=True)

@app.route("/<int:id>",methods=["POST","GET"])
def page_editDocument(id):
    if not current_user.is_authenticated:
        return redirect('/login')
    if not id or len(str(id)) < 1:
        return redirect('/')
    document = Document.query.filter_by(Author_id=current_user.id,Id=id).first()
    if document:
        if (document.DocumentType == "Text") and not request.form:
            context={
                'documentName' : document.DocumentName,
                "documentContent" : document.Content,
                "downloadfile" : f"{document.Id}.txt",
            }
            with open(f"static/files/{document.Id}.txt","w") as file:
                file.close()
            return render_template("Editor(Text).html",context=context)
        if (document.DocumentType == "Json") and not request.form:
            context={
                'documentName' : document.DocumentName,
                "documentContent" : document.Content,
                "downloadfile" : f"{document.Id}.json",
            }
            with open(f"static/files/{document.Id}.json","w") as file:
                file.close()
            return render_template("Editor(Json).html",context=context)
        if document.DocumentType == "Csv" and not request.form:
            context={
                'documentName' : document.DocumentName,
                'documentContent' : document.Content,
                "downloadfile" : f"{document.Id}.csv",
            }
            with open(f"static/files/{document.Id}.json","w") as file:
                file.close()
            if len(context["documentContent"]) < 2:
                print("new-default!")
                context['documentContent'] = {}
                for step in range(50):
                    context["documentContent"][str(step)] = {'name' : "","rows":["" for i in range(10)]}
                context["documentContent"] = str(context["documentContent"]).replace("'",'"')
            context['documentContent'] = json.loads(context["documentContent"])
            for key in context["documentContent"].keys():
                    item_layer1 = context["documentContent"][key]
                    rows = item_layer1['rows']
                    empty = 0
                    for i in rows:
                        if len(i) < 1:
                            empty += 1
                    if empty < len(rows)/2:
                        for KEY in context["documentContent"]:
                           item = context["documentContent"][KEY]
                           for i in range(10):
                               item['rows'].append("")
            context['documentContent'] = str(context["documentContent"]).replace("'",'"')                     
            return render_template("Editor(Csv).html",context=context)

        if request.form:
            form = request.form
            if 'content' in form and 'document-name' in form and not 'address' in form:
                try:
                    document.Content = form['content']
                    document.DocumentName = form['document-name']

                    db.session.commit()
                    print(document.Id," new data saved!")

                    if document.DocumentType in endings:
                        print(document.DocumentType)
                        print(f"static/files/{document.Id}.{endings[document.DocumentType]}")
                        with open(f"static/files/{document.Id}.{endings[document.DocumentType]}","w") as file:
                            if document.DocumentType == "Text":
                                file.write(document.Content)
                                file.close()
                            if document.DocumentType == "Json":
                                json.dump(json.loads(document.Content),file)
                                file.close()
                            if document.DocumentType == "Csv":
                                fieldnames = []
                                json_content = json.loads(document.Content)
                                for key in json_content.keys():
                                    if len(json_content[key]['name']) > 0:
                                        fieldnames.append(json_content[key]['name'])

                                writer = csv.DictWriter(file,fieldnames=fieldnames)
                                writer.writeheader()
                                rowlen = 0
                                for i in json_content['1']['rows']:
                                    if len(i) < 1:
                                        continue
                                    else:
                                        rowlen += 1
                                for i in range(rowlen):
                                    row = {}
                                    for key in json_content.keys():
                                        if len(json_content[key]['name']) < 1:
                                            continue
                                        row[json_content[key]['name']] = json_content[key]['rows'][i]
                                    if len(row) > 0:
                                        writer.writerow(row)

                                file.close()


                    return jsonify({'status':True})
                except:
                    db.session.rollback()
                    return jsonify({'status':False})
            

                
    return str(id)


@app.route("/login",methods=["POST","GET"])
def page_login():
    if request.form:
        form = request.form
        user = User.query.filter_by(Email=form['Email'],Password=form['Password'])
        if user.first():
            user = user.first()
            login_user(user)
            return redirect("/")
        else:
            return redirect("/register")
    return render_template("login.html")
@app.route("/register",methods=["POST","GET"])
def page_register():
    if request.form:
        form = request.form
        user = User.query.filter_by(Username=form['Username'])
        if not user.first():
            user = User(Password=form['Password'],Email=form['Email'],Username=form['Username'])
            login_user(user)
            return redirect("/")
    return render_template("register.html")


from waitress import serve
if __name__ == "__main__":
    serve(app,host='0.0.0.0',port='80')