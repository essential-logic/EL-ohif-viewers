
import React, { useState, useEffect } from 'react';
import { ButtonBase, Menu, MenuItem, ListItemIcon, Tooltip, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowDropDown } from '@mui/icons-material';

interface Tool {
  id: string;
  icon: React.ElementType;
  label: string; // Tooltip text
  action?: (e?: React.MouseEvent) => void; // Optional direct action (e.g. Reset)
}

interface ToolGroupProps {
  tools: Tool[];
  activeTool: string;
  onSelect: (toolId: string) => void;
  direction?: 'right' | 'bottom'; // Flyout direction
}

export function ToolGroup({ tools, activeTool, onSelect, direction = 'right' }: ToolGroupProps) {
  // The currently visible tool in the toolbar (defaults to first in group)
  const [currentTool, setCurrentTool] = useState<Tool | undefined>(tools[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // If an external change selects a tool in this group, update the visible tool
  useEffect(() => {
    const found = tools.find(t => t.id === activeTool);
    if (found) {
      setCurrentTool(found);
    }
  }, [activeTool, tools]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Only open menu if there are multiple tools
    if (tools.length > 1) {
        setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (tool: Tool) => {
    setCurrentTool(tool);
    if (tool.action) {
        tool.action();
    } else {
        onSelect(tool.id);
    }
    handleClose();
  };

  // Determine if this group is active (any of its tools is active)
  const isActive = tools.some(t => t.id === activeTool);
  
  if (!currentTool) return null;

  const Icon = currentTool.icon;

  return (
    <>
      <Tooltip title={currentTool.label} placement="right">
        <ButtonBase
          component={motion.button}
          onClick={(e) => {
              if (currentTool.action) {
                  currentTool.action(e);
              } else {
                  onSelect(currentTool.id);
              }
          }}
          onContextMenu={(e) => {
              e.preventDefault();
              handleOpen(e);
          }}
          sx={{
            position: 'relative',
            p: 0.75,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'transparent',
            color: isActive ? '#3b82f6' : '#94a3b8',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.05)',
              color: isActive ? '#60a5fa' : '#f8fafc',
            },
            width: '100%',
            aspectRatio: '1/1',
            minHeight: 32,
          }}
        >
          <motion.div
            animate={{ 
              scale: isActive ? 1.3 : 1,
              filter: isActive ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex' }}
          >
            <Icon sx={{ fontSize: 20, fontWeight: isActive ? 900 : 400 }} />
          </motion.div>
          
          {/* Triangle Indicator for Nested Tools */}
          {tools.length > 1 && (
            <Box 
                sx={{ 
                    position: 'absolute', 
                    bottom: 2, 
                    right: 2, 
                    width: 0, 
                    height: 0, 
                    borderStyle: 'solid', 
                    borderWidth: '0 0 5px 5px', 
                    borderColor: 'transparent transparent currentColor transparent',
                    opacity: 0.7 
                }} 
            />
          )}
        </ButtonBase>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            bgcolor: '#0f172a', // Slate-900
            border: '1px solid #1e293b', // Slate-800
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            mt: -1,
            ml: 1,
            minWidth: 160,
            color: '#e2e8f0', // Slate-200
            '& .MuiMenuItem-root': {
                fontSize: '0.85rem',
                py: 1.5,
                gap: 2,
                '&:hover': {
                    bgcolor: '#1e293b'
                },
                '&.Mui-selected': {
                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                    color: '#3b82f6',
                    '&:hover': {
                        bgcolor: 'rgba(59, 130, 246, 0.25)',
                    }
                }
            }
          }
        }}
      >
        {tools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
                <MenuItem 
                    key={tool.id} 
                    selected={tool.id === activeTool}
                    onClick={() => handleSelect(tool)}
                >
                    <ListItemIcon sx={{ minWidth: 24, color: 'inherit' }}>
                        <ToolIcon fontSize="small" />
                    </ListItemIcon>
                    {tool.label}
                </MenuItem>
            );
        })}
      </Menu>
    </>
  );
}
