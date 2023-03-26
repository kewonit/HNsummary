# Define variables
DIRNAME := $(shell basename $(CURDIR))
ZIPFILE := $(DIRNAME).zip
EXCLUDE := .git/**\* .DS_Store .idea/**\* Makefile

# Define default target
all: zip

# Define zip target
zip:
	@echo "Creating $(ZIPFILE)..."
	@zip -r $(ZIPFILE) ./ -x $(EXCLUDE)

# Define clean target
clean:
	@echo "Cleaning up..."
	@rm -f $(ZIPFILE)

.PHONY: all zip clean
