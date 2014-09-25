PACKAGE = sogo-integrator
GIT_REV = $(shell git rev-parse --verify HEAD | cut -c1-10)

VERSION = $(shell awk -F'"' '/em:version="/ {print $$2}' <install.rdf)
FIND_FILTER = ! -path './custom/*' -type f

ifndef XPI_ARCHIVE
  ifeq ($(build),)
    XPI_ARCHIVE = $(PACKAGE)-$(VERSION)-$(GIT_REV).xpi
  else
    XPI_ARCHIVE = $(PACKAGE)-$(VERSION)-$(GIT_REV)-$(build).xpi
  endif
endif

SHELL = /bin/bash
ZIP = /usr/bin/zip

all: custom-build MANIFEST rest

custom-build:
	@if test "x$$build" == "x"; then \
	  echo "Building package with default settings."; \
	else \
	  echo "Building package with custom settings for '$$build'."; \
	  if ! test -d custom/$$build; then \
	    echo "Custom build '$$build' does not exist"; \
	    exit 1; \
	  fi; fi

.PHONY: MANIFEST
MANIFEST:
	@echo chrome.manifest > $@
	@echo NEWS >> $@
	@echo COPYING >> $@
	@find . $(FIND_FILTER) -name "*.dtd" >> $@
	@find . $(FIND_FILTER) -name "*.gif" >> $@
	@find . $(FIND_FILTER) -name "*.idl" >> $@
	@find . $(FIND_FILTER) -name "*.js" >> $@
	@find . $(FIND_FILTER) -name "*.css" >> $@
	@find . $(FIND_FILTER) -name "*.jpg" >> $@
	@find . $(FIND_FILTER) -name "*.png" >> $@
	@find . $(FIND_FILTER) -name "*.properties" >> $@
	@find . $(FIND_FILTER) -name "*.rdf" >> $@
	@find . $(FIND_FILTER) -name "*.xpt" >> $@
	@find . $(FIND_FILTER) -name "*.xul" >> $@
	@find . $(FIND_FILTER) -name "*.xml" >> $@

rest:
	@make $(XPI_ARCHIVE)

$(XPI_ARCHIVE): FILENAMES = $(shell cat MANIFEST)
$(XPI_ARCHIVE): $(FILENAMES)
	@echo Generating $(XPI_ARCHIVE)...
	@rm -f $(XPI_ARCHIVE)
	@$(ZIP) -9r $(XPI_ARCHIVE) $(FILENAMES) > /dev/null
	@if test "x$$build" != "x"; then \
	  cd custom/$$build; \
	  $(ZIP) -9r ../../$(XPI_ARCHIVE) * > /dev/null; \
	fi

clean:
	rm -f MANIFEST-pre
	rm -f *.xpi
	find . -name "*~" -exec rm -f {} \;

distclean: clean
	rm -f MANIFEST
