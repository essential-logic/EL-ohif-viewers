import React, { useState, useEffect } from 'react';
import { ButtonBase, Menu, MenuItem, ListItemIcon, Tooltip, Box } from '@mui/material';
import { motion } from 'framer-motion';

interface Tool {
  id: string;
  icon: React.ElementType | React.ReactNode;
  label: string;
  action?: (e?: React.MouseEvent) => void;
}

interface ToolGroupProps {
  tools: Tool[];
  activeTool: string;
  onSelect: (toolId: string) => void;
  direction?: 'right' | 'bottom';
}

export function ToolGroup({ tools, activeTool, onSelect, direction = 'right' }: ToolGroupProps) {
  const [currentTool, setCurrentTool] = useState<Tool | undefined>(tools[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const found = tools.find(t => t.id === activeTool);
    if (found) {
      setCurrentTool(found);
    }
  }, [activeTool, tools]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
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

  const isActive = tools.some(t => t.id === activeTool);

  if (!currentTool) {
    return null;
  }

  // Handle both ReactElement (<Icon />) and ElementType (IconComponent)
  const isElementType =
    typeof currentTool.icon === 'function' || typeof currentTool.icon === 'object';
  const IconElement =
    isElementType && !React.isValidElement(currentTool.icon)
      ? (currentTool.icon as React.ElementType)
      : null;

  return (
    <>
      <Tooltip
        title={currentTool.label}
        placement="right"
        arrow
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
              fontSize: '0.75rem',
              fontWeight: 500,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            },
          },
          arrow: {
            sx: {
              color: 'rgba(15, 23, 42, 0.9)',
              '&::before': {
                border: '1px solid rgba(255,255,255,0.1)',
              },
            },
          },
        }}
      >
        <ButtonBase
          component={motion.button as any}
          onClick={e => {
            if (currentTool.action) {
              currentTool.action(e);
            } else {
              onSelect(currentTool.id);
            }
          }}
          onContextMenu={e => {
            e.preventDefault();
            handleOpen(e);
          }}
          sx={{
            position: 'relative',
            p: 1.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: isActive ? '#3b82f6' : '#94a3b8',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.05)',
              color: isActive ? '#60a5fa' : '#f8fafc',
            },
            width: '100%',
            aspectRatio: '1/1',
            minHeight: 44,
          }}
        >
          {IconElement ? <IconElement sx={{ fontSize: 22 }} /> : currentTool.icon}

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
                opacity: 0.7,
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
            bgcolor: '#0f172a',
            border: '1px solid #1e293b',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            mt: -1,
            ml: 1,
            minWidth: 160,
            color: '#e2e8f0',
            '& .MuiMenuItem-root': {
              fontSize: '0.85rem',
              py: 1.5,
              gap: 2,
              '&:hover': {
                bgcolor: '#1e293b',
              },
              '&.Mui-selected': {
                bgcolor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.25)',
                },
              },
            },
          },
        }}
      >
        {tools.map(tool => {
          const isTElementType = typeof tool.icon === 'function' || typeof tool.icon === 'object';
          const TIconElement =
            isTElementType && !React.isValidElement(tool.icon)
              ? (tool.icon as React.ElementType)
              : null;

          return (
            <MenuItem
              key={tool.id}
              selected={tool.id === activeTool}
              onClick={() => handleSelect(tool)}
            >
              <ListItemIcon sx={{ minWidth: 24, color: 'inherit' }}>
                {TIconElement ? <TIconElement fontSize="small" /> : tool.icon}
              </ListItemIcon>
              {tool.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
