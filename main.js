let selectedId = 0;
let selectedCommentId = 0;

async function LoadComments(postId) {
    let res = await fetch(
        `http://localhost:3000/comments?postId=${postId}`
    );
    let comments = await res.json();

    let body = document.getElementById("comment_body");
    body.innerHTML = '';

    comments.forEach(c => {
        if (!c.isDeleted) {
            body.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.text}</td>
                    <td>
                        <button onclick="EditComment('${c.id}')">Edit</button>
                        <button onclick="DeleteComment('${c.id}')">Delete</button>
                    </td>
                </tr>
            `;
        } else {
            body.innerHTML += `
                <tr>
                    <td style="text-decoration: line-through">${c.id}</td>
                    <td style="text-decoration: line-through">${c.text}</td>
                    <td></td>
                </tr>
            `;
        }
    });
}


async function LoadData() {
    let res = await fetch("http://localhost:3000/posts")
    let posts = await res.json();
    console.log(posts);
    let body = document.getElementById("body_table");
    body.innerHTML = '';

    posts.forEach(post => {
        if (!post.isDeleted) {
            body.innerHTML += `<tr>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td><input type="submit" value="Delete" onclick="Delete( ${post.id})"/></td>
            <td><input type="submit" value="Edit" onclick="show( ${post.id})"/></td>
        </tr>`
        } else {
            body.innerHTML += `<tr>
                <td style="text-decoration: line-through">${post.id}</td>
                <td style="text-decoration: line-through">${post.title}</td>
                <td style="text-decoration: line-through">${post.views}</td>
            </tr>`;
        }
    });
}

async function show(id) {
    selectedId = id;

    let res = await fetch('http://localhost:3000/posts/' + id);
    const item = await res.json();

    document.getElementById("title_txt").value = item.title;
    document.getElementById("view_txt").value = item.views;

    LoadComments(id);
}


async function Save() {
    // let id = document.getElementById("id_txt").value;

    let res = await fetch("http://localhost:3000/posts");
    let posts = await res.json();
    let maxId = posts.length > 0
        ? Math.max(...posts.map(p => p.id))
        : 0;

    // const id = +idString;

    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    // let getItem = await fetch('http://localhost:3000/posts/' + id)
    if (selectedId != 0) {
        let res = await fetch('http://localhost:3000/posts/' + selectedId, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                views: views
            })
        });
        if (res.ok) {
            document.getElementById("title_txt").value = ''
            document.getElementById("view_txt").value = '';
            console.log("Thanh cong");
        }
    } else {
        try {
            let res = await fetch('http://localhost:3000/posts', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: maxId + 1,
                    title: title,
                    views: views,
                    isDeleted: false
                })
            });
            if (res.ok) {
                document.getElementById("title_txt").value = ''
                document.getElementById("view_txt").value = '';
                console.log("Thanh cong");
            }
        } catch (error) {
            console.log(error);
        }
    }
    LoadData();
    return false;

}

async function Delete(id) {
    let res = await fetch("http://localhost:3000/posts/" + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: true,
        })
    });
    if (res.ok) {
        console.log("Thanh cong");
    }
    LoadData();
    return false;
}

async function SaveComment() {
    if (selectedId == 0) {
        alert("Please select a post first!");
        return;
    }

    let text = document.getElementById("comment_txt").value;

    if (selectedCommentId != 0) {
        await fetch(`http://localhost:3000/comments/${selectedCommentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        selectedCommentId = 0;
    } else {
        let res = await fetch("http://localhost:3000/comments");
        let comments = await res.json();

        let maxId = comments.length > 0
            ? Math.max(...comments.map(c => +c.id))
            : 0;

        await fetch("http://localhost:3000/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: String(maxId + 1),
                text: text,
                postId: selectedId,
                isDeleted: false
            })
        });
    }

    document.getElementById("comment_txt").value = '';
    LoadComments(selectedId);
}

async function EditComment(id) {
    selectedCommentId = id;

    let res = await fetch(`http://localhost:3000/comments/${id}`);
    let comment = await res.json();

    document.getElementById("comment_txt").value = comment.text;
}

async function DeleteComment(id) {
    await fetch(`http://localhost:3000/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });

    LoadComments(selectedId);
}

LoadData();