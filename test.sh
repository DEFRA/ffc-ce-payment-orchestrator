#!/bin/bash

STR="!@£$%^&*(')\`_+\,-={}[]:;\"<>.?/|\\\~" ; echo $STR

#helm upgrade ffc-ce-payment-orchestrator-pr43 --namespace=ffc-ce-payment-orchestrator-pr43 ./helm/ffc-ce-payment-orchestrator  --set image=ssvffcfesac1001.azurecr.io/ffc-ce-payment-orchestrator:pr43,namespace=ffc-ce-payment-orchestrator-pr43,pr=pr43,deployment.redeployOnChange=pr43-137 --set labels.version=pr43 --install --atomic --version=pr43 --set post.username="qqq2!@£$%^&*(')\`_+\,-={}[]:;\"<>.?/|\\\~qqq2"
