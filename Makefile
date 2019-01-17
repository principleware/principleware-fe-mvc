include Makefile.inc

DST_DIR := src
SRC_DIR := host

PACKAGE_SOURCES := $(SRC_DIR)/mediators/interfaces.ts \
$(SRC_DIR)/mediators/noop-view-instance.ts \
$(SRC_DIR)/mediators/abstract-list.ts \
$(SRC_DIR)/mediators/writable-abstract-list.ts \
$(SRC_DIR)/mediators/ngstore-abstract-list.ts \
$(SRC_DIR)/mediators/rxjs-powered-writable-abstract-list.ts \
$(SRC_DIR)/controllers/list-controller.ts 

PACKAGE_TARGETS := $(subst $(SRC_DIR),$(DST_DIR),$(PACKAGE_SOURCES))

# rules

$(DST_DIR)/mediators/%.ts: $(SRC_DIR)/mediators/%.ts
	$(ECHO) Making a file $@ from $<
	$(MKDIR) -p $(dir $@)
	$(CP) $(CPFlALGS) $< $@

$(DST_DIR)/controllers/%.ts: $(SRC_DIR)/controllers/%.ts
	$(ECHO) Making a file $@ from $<
	$(MKDIR) -p $(dir $@)
	$(CP) $(CPFlALGS) $< $@


prepare_dir:
	echo "Preparing directory ..."
#	rm -rf $(DST_DIR)
	echo "Generating src ..."

$(PACKAGE_TARGETS): | prepare_dir

publish: $(PACKAGE_TARGETS)

test:
	echo $(PACKAGE_SOURCES)
	echo $(PACKAGE_TARGETS)


