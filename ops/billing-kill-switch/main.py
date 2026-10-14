"""Turns off billing for the project once its budget is used up.

A Cloud Billing budget posts its current spend to a Pub/Sub topic several
times a day; this function runs on each message. Turning billing off stops
everything in the project, so the site goes offline until billing is turned
back on in the console. Set DRY_RUN=true to only log what it would do.
"""

import base64
import json
import os
import urllib.request

import functions_framework

PROJECT = os.environ["TARGET_PROJECT"]
DRY_RUN = os.environ.get("DRY_RUN") == "true"


def access_token():
    req = urllib.request.Request(
        "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
        headers={"Metadata-Flavor": "Google"},
    )
    return json.load(urllib.request.urlopen(req))["access_token"]


@functions_framework.cloud_event
def stop_billing(event):
    data = json.loads(base64.b64decode(event.data["message"]["data"]))
    cost, budget = data["costAmount"], data["budgetAmount"]
    spent = f"Spent {cost} of {budget} {data.get('currencyCode', '')}".strip()
    if cost < budget:
        print(f"{spent}; leaving billing on")
        return
    if DRY_RUN:
        print(f"{spent}; would turn billing off for {PROJECT} (dry run)")
        return
    req = urllib.request.Request(
        f"https://cloudbilling.googleapis.com/v1/projects/{PROJECT}/billingInfo",
        method="PUT",
        data=json.dumps({"billingAccountName": ""}).encode(),
        headers={"Authorization": f"Bearer {access_token()}", "Content-Type": "application/json"},
    )
    urllib.request.urlopen(req).read()
    print(f"{spent}; turned billing off for {PROJECT}")
