var functions = require("firebase-functions");
var admin = require("firebase-admin");
var webpush = require("web-push");

admin.initializeApp();

var VAPID_PUBLIC = "BF7CnYIwdBjsgGfpV57r8NbpM70eoQ1uW1EZjPpKX1RGuG626F8meosAeYC8oVmOJ1M_BWIzdXM1MGgAmdgD4W0";
var VAPID_PRIVATE = "pXYTlqZBqHGHovWZNV6gdgpfzNsP4MTxqWGj7-WiYe4";

webpush.setVapidDetails(
    "mailto:joe@joes30.com",
    VAPID_PUBLIC,
    VAPID_PRIVATE
);

var DB_INSTANCE = "joes-30th-default-rtdb";

// Send push to all subscriptions
function sendToAll(title, body, url) {
    return admin.database().ref("subscriptions").once("value")
        .then(function(snap) {
            var subs = snap.val();
            if (!subs) return Promise.resolve();

            var promises = [];
            Object.keys(subs).forEach(function(code) {
                var sub = subs[code];
                if (!sub || !sub.endpoint) return;

                var payload = JSON.stringify({
                    title: title,
                    body: body,
                    url: url || "/"
                });

                var p = webpush.sendNotification(sub, payload).catch(function(err) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        return admin.database().ref("subscriptions/" + code).remove();
                    }
                    console.error("Push failed for " + code + ":", err.message);
                });
                promises.push(p);
            });

            return Promise.all(promises);
        });
}

// Trigger on new announcements
exports.onAnnouncement = functions.database
    .instance(DB_INSTANCE)
    .ref("/announcements/{id}")
    .onCreate(function(snapshot) {
        var data = snapshot.val();
        if (!data) return null;

        var title = "joes30.com";
        var body = data.content || data.text || "New announcement";
        var typeEmoji = { info: "📢", celebration: "🎉", alert: "⚠️" };
        title = (typeEmoji[data.announcementType] || "📢") + " " + title;

        return sendToAll(title, body, "/livefeed.html");
    });

// Trigger on bingo line completions
exports.onBingoLine = functions.database
    .instance(DB_INSTANCE)
    .ref("/bingo/lines/{id}")
    .onCreate(function(snapshot) {
        var data = snapshot.val();
        if (!data) return null;

        var body = data.guestName + " got a BINGO LINE!";
        if (data.punishmentTarget) {
            body += " " + data.punishmentTarget + " must: " + (data.punishmentDesc || "face the consequences!");
        }

        return sendToAll("🎯 BINGO!", body, "/games.html");
    });

// Trigger on points awarded (notify individual)
exports.onPointsAwarded = functions.database
    .instance(DB_INSTANCE)
    .ref("/feed/{id}")
    .onCreate(function(snapshot) {
        var data = snapshot.val();
        if (!data || data.type !== "points") return null;

        if (!data.guestCode) return null;

        return admin.database().ref("subscriptions/" + data.guestCode).once("value")
            .then(function(snap) {
                var sub = snap.val();
                if (!sub || !sub.endpoint) return null;

                var payload = JSON.stringify({
                    title: "🏆 Points!",
                    body: "You earned " + (data.points || "") + " points" + (data.reason ? ": " + data.reason : ""),
                    url: "/games.html"
                });

                return webpush.sendNotification(sub, payload).catch(function(err) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        return admin.database().ref("subscriptions/" + data.guestCode).remove();
                    }
                });
            });
    });

// HTTP endpoint to test push — call from browser/admin
exports.testPush = functions.https.onRequest(function(req, res) {
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    var guestCode = req.query.code || "";
    var message = req.query.msg || "Test notification from joes30.com!";

    if (guestCode) {
        // Send to specific guest
        admin.database().ref("subscriptions/" + guestCode).once("value")
            .then(function(snap) {
                var sub = snap.val();
                if (!sub || !sub.endpoint) {
                    res.json({ ok: false, error: "No subscription for " + guestCode });
                    return;
                }
                var payload = JSON.stringify({ title: "🧪 Test", body: message, url: "/" });
                return webpush.sendNotification(sub, payload).then(function() {
                    res.json({ ok: true, sentTo: guestCode });
                });
            })
            .catch(function(err) {
                res.json({ ok: false, error: err.message });
            });
    } else {
        // Send to all
        sendToAll("🧪 Test", message, "/").then(function() {
            res.json({ ok: true, sentTo: "all" });
        }).catch(function(err) {
            res.json({ ok: false, error: err.message });
        });
    }
});
